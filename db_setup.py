import psycopg2

def get_db_connection():
    conn = psycopg2.connect(
        dbname="face_login",
        user="postgres",
        password="Likhitha2809",
        host="localhost",
        port="5432"
    )
    return conn
