import psycopg2


def main() -> None:
    conn = psycopg2.connect(
        dbname="postgres",
        user="postgres",
        password="postgres",
        host="localhost",
        port=5432,
    )
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM pg_database WHERE datname = 'academic_perf_db'")
    exists = cur.fetchone()

    if not exists:
        cur.execute("CREATE DATABASE academic_perf_db")
        print("created")
    else:
        print("exists")

    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
