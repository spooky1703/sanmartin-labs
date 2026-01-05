import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import bcrypt

# Cargar variables de entorno
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("[ERROR] No se encontró DATABASE_URL en el archivo .env")
    print("Asegúrate de tener un archivo .env con la conexión a la base de datos.")
    sys.exit(1)

def get_connection():
    try:
        return psycopg2.connect(DATABASE_URL)
    except Exception as e:
        print(f"[ERROR] Al conectar a la base de datos: {e}")
        return None

def listar_usuarios():
    conn = get_connection()
    if not conn: return

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT u.id, u.nombre, u.apellido, u.email, u.rol, u.activo, l.nombre as laboratorio
                FROM usuarios u
                JOIN laboratorios l ON u."laboratorioId" = l.id
                ORDER BY u."createdAt" DESC
            """)
            usuarios = cur.fetchall()

            print("\nLISTA DE USUARIOS")
            print("-" * 110)
            print(f"{'NOMBRE':<20} | {'EMAIL':<30} | {'ROL':<10} | {'LABORATORIO':<20} | {'ACTIVO'}")
            print("-" * 110)
            
            for u in usuarios:
                nombre_completo = f"{u['nombre']} {u['apellido']}"
                estado = "ACTIVO" if u['activo'] else "INACTIVO"
                print(f"{nombre_completo:<20} | {u['email']:<30} | {u['rol']:<10} | {u['laboratorio']:<20} | {estado}")
            print("-" * 110)
            print(f"Total: {len(usuarios)} usuarios\n")

    except Exception as e:
        print(f"[ERROR] Al listar usuarios: {e}")
    finally:
        conn.close()

def gestionar_usuario():
    email = input("\nIngresa el EMAIL del usuario a gestionar: ").strip()
    if not email: return

    conn = get_connection()
    if not conn: return

    try:
        with conn.cursor() as cur:
            # Verificar si existe
            cur.execute('SELECT id, activo FROM usuarios WHERE email = %s', (email,))
            user = cur.fetchone()
            
            if not user:
                print(f"[ERROR] Usuario con email '{email}' no encontrado.")
                return

            user_id, is_active = user

            print(f"\nUsuario encontrado: {email}")
            print(f"Estado actual: {'ACTIVO' if is_active else 'INACTIVO'}")
            
            print("\nOpciones disponibles:")
            if is_active:
                print("1. Desactivar (Recomendado - impide acceso pero guarda historial)")
                print("2. Eliminar definitivamente (Solo si no tiene reportes)")
            else:
                print("1. Reactivar acceso")
                print("2. Eliminar definitivamente")
            print("3. Cambiar Contraseña")
            
            opcion = input("\nSelecciona una opción (1-3): ").strip()

            if opcion == "1":
                new_status = not is_active
                cur.execute('UPDATE usuarios SET activo = %s WHERE email = %s', (new_status, email))
                conn.commit()
                action = "Reactivado" if new_status else "Desactivado"
                print(f"[OK] Usuario {email} ha sido {action} correctamente.")
            
            elif opcion == "2":
                confirm = input(f"[ADVERTENCIA] ¿Estás SEGURO de eliminar a {email}? Esta acción NO se puede deshacer (s/n): ").lower()
                if confirm == 's':
                    try:
                        cur.execute('DELETE FROM usuarios WHERE email = %s', (email,))
                        conn.commit()
                        print(f"[OK] Usuario {email} eliminado correctamente.")
                    except psycopg2.errors.ForeignKeyViolation:
                        conn.rollback()
                        print(f"\n[ERROR] No se puede eliminar por integridad de datos (tiene reportes asociados).")
                        desactivar = input("¿Deseas DESACTIVARLO en su lugar? (s/n): ").lower()
                        if desactivar == 's':
                            cur.execute('UPDATE usuarios SET activo = false WHERE email = %s', (email,))
                            conn.commit()
                            print(f"[OK] Usuario {email} desactivado correctamente.")
                else:
                    print("Operación cancelada.")

            elif opcion == "3":
                new_pass = input("Ingresa la nueva contraseña: ").strip()
                if not new_pass:
                    print("[ERROR] La contraseña no puede estar vacía.")
                    return
                
                salt = bcrypt.gensalt(rounds=10)
                hashed_password = bcrypt.hashpw(new_pass.encode('utf-8'), salt).decode('utf-8')
                
                cur.execute('UPDATE usuarios SET password = %s, "updatedAt" = NOW() WHERE email = %s', (hashed_password, email))
                conn.commit()
                print(f"[OK] Contraseña actualizada correctamente para {email}.")

            else:
                print("Opción inválida.")

    except Exception as e:
        print(f"[ERROR] Al gestionar usuario: {e}")
    finally:
        conn.close()

def crear_usuario():
    print("\nCREAR NUEVO USUARIO")
    conn = get_connection()
    if not conn: return

    try:
        with conn.cursor() as cur:
            # Seleccionar Laboratorio
            cur.execute("SELECT id, nombre FROM laboratorios")
            labs = cur.fetchall()
            
            if not labs:
                print("[ERROR] No hay laboratorios registrados. Debes crear un laboratorio primero (o hacer seed).")
                return

            print("\nLaboratorios disponibles:")
            for i, lab in enumerate(labs):
                print(f"{i+1}. {lab[1]} (ID: {lab[0]})")
            
            lab_index = int(input("\nSelecciona el laboratorio (#): ") or "1") - 1
            if lab_index < 0 or lab_index >= len(labs):
                print("[ERROR] Selección inválida.")
                return
            
            laboratorio_id = labs[lab_index][0]

            # Datos del usuario
            print("\n----- Datos del Usuario -----")
            nombre = input("Nombre: ").strip()
            apellido = input("Apellido: ").strip()
            email = input("Email: ").strip()
            password = input("Contraseña: ").strip()
            
            if not all([nombre, apellido, email, password]):
                print("[ERROR] Todos los campos son obligatorios.")
                return

            # Rol
            print("\nRoles: [1] TECNICO  [2] SUPERVISOR  [3] ADMIN")
            rol_map = {"1": "TECNICO", "2": "SUPERVISOR", "3": "ADMIN"}
            rol_sel = input("Selecciona Rol (1-3) [Default: TECNICO]: ").strip()
            rol = rol_map.get(rol_sel, "TECNICO")

            # Hash Password
            salt = bcrypt.gensalt(rounds=10)
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

            # Insertar
            try:
                # Usamos uuid para generación de ID si Postgres no tiene gen_random_uuid disponible o configurado.
                import uuid
                new_id = str(uuid.uuid4())

                cur.execute("""
                    INSERT INTO usuarios (id, nombre, apellido, email, password, rol, "laboratorioId", activo, "createdAt", "updatedAt")
                    VALUES (%s, %s, %s, %s, %s, %s, %s, true, NOW(), NOW())
                """, (new_id, nombre, apellido, email, hashed_password, rol, laboratorio_id))
                conn.commit()
                print(f"\n[OK] Usuario {email} creado exitosamente como {rol}.")
            except psycopg2.errors.UniqueViolation:
                conn.rollback()
                print("\n[ERROR] Ya existe un usuario con ese email.")
            except Exception as e:
                conn.rollback()
                print(f"\n[ERROR] Al crear usuario: {e}")

    except Exception as e:
        print(f"[ERROR] {e}")
    finally:
        conn.close()

def limpiar_datos_operativos():
    print("\nLIMPIEZA DE DATOS OPERATIVOS (PRODUCCION)")
    print("Esta acción eliminará:")
    print("1. Historial de Auditoría")
    print("2. Reportes generados")
    print("3. Estudios y Parámetros clínicos")
    print("4. Pacientes")
    print("\n[INFO] Los LABORATORIOS y USUARIOS se MANTENDRÁN.")
    print("-" * 60)
    
    confirm1 = input("¿Estás SEGURO de eliminar toda la data operativa? (s/n): ").lower()
    if confirm1 != 's': return

    code = input("Escribe 'LIMPIAR PROD' para confirmar: ")
    if code != 'LIMPIAR PROD':
        print("Operación cancelada.")
        return

    conn = get_connection()
    if not conn: return

    try:
        with conn.cursor() as cur:
            print("\nIniciando limpieza profunda...")
            
            tables_to_clear = [
                "auditoria_logs",
                "reporte_estudios",
                "reportes",
                "parametros_estudio",
                "estudios",
                "pacientes"
            ]
            
            for table in tables_to_clear:
                print(f"Limpiando tabla: {table}...")
                cur.execute(f'DELETE FROM "{table}"')

            conn.commit()
            print("\n[OK] Limpieza completada con éxito.")
            print("El sistema está listo para operar desde cero.")

    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Al limpiar datos: {e}")
    finally:
        conn.close()

def ver_estadisticas():
    conn = get_connection()
    if not conn: return

    try:
        with conn.cursor() as cur:
            cur.execute('SELECT COUNT(*) FROM usuarios')
            total_usuarios = cur.fetchone()[0]

            cur.execute('SELECT COUNT(*) FROM pacientes')
            total_pacientes = cur.fetchone()[0]

            cur.execute('SELECT COUNT(*) FROM reportes')
            total_reportes = cur.fetchone()[0]
            
            cur.execute('SELECT COUNT(*) FROM reportes WHERE "createdAt" > NOW() - INTERVAL \'24 hours\'')
            reportes_hoy = cur.fetchone()[0]

            # Tamaño de la Base de Datos
            cur.execute("SELECT pg_size_pretty(pg_database_size(current_database()))")
            db_size = cur.fetchone()[0]

            print("\nESTADISTICAS DEL SISTEMA")
            print("-" * 50)
            print(f"Usuarios Totales:      {total_usuarios}")
            print(f"Pacientes Registrados: {total_pacientes}")
            print(f"Reportes Generados:    {total_reportes}")
            print(f"Reportes Ultimas 24h:  {reportes_hoy}")
            print("-" * 50)
            print(f"Espacio en Disco (DB): {db_size}")
            print("-" * 50)

            # Detalle de Tablas
            cur.execute("""
                SELECT 
                    t.table_name,
                    pg_size_pretty(pg_total_relation_size('"' || t.table_name || '"')) as size_pretty,
                    pg_total_relation_size('"' || t.table_name || '"') as size_bytes
                FROM information_schema.tables t
                WHERE t.table_schema = 'public'
                ORDER BY size_bytes DESC
            """)
            tables_info = cur.fetchall()

            print("\nDETALLE DE TABLAS (ORDENADO POR TAMANO)")
            print("-" * 60)
            print(f"{'TABLA':<25} | {'FILAS':<10} | {'PESO'}")
            print("-" * 60)

            for table in tables_info:
                t_name = table[0]
                t_size = table[1]
                
                try:
                    cur.execute(f'SELECT COUNT(*) FROM "{t_name}"')
                    rows = cur.fetchone()[0]
                except:
                    rows = "?"

                print(f"{t_name:<25} | {rows:<10} | {t_size}")
            
            print("-" * 60)
            print("\n[NOTA] Para ver CPU y RAM, consulta el dashboard de Railway.")
            print("-" * 60 + "\n")

    except Exception as e:
        print(f"[ERROR] Al obtener estadísticas: {e}")
    finally:
        conn.close()

def main():
    while True:
        print("\nADMIN PANEL - SAN MARTIN LABS")
        print("1. Ver Usuarios")
        print("2. Gestionar Usuario (Desactivar/Eliminar)")
        print("3. Crear Nuevo Usuario")
        print("4. Ver Estadisticas Generales")
        print("5. Limpiar Datos (Prod Ready - Borra Pacientes/Reportes)")
        print("6. Salir")
        
        opcion = input("\nSelecciona una opción: ")

        if opcion == "1":
            listar_usuarios()
        elif opcion == "2":
            gestionar_usuario()
        elif opcion == "3":
            crear_usuario()
        elif opcion == "4":
            ver_estadisticas()
        elif opcion == "5":
            limpiar_datos_operativos()
        elif opcion == "6":
            print("Adios!")
            break
        else:
            print("Opcion no valida.")

if __name__ == "__main__":
    main()
