import sqlite3
try:
    conn = sqlite3.connect('conversational_ecommerce.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    print([r[0] for r in cursor.fetchall()])
    conn.close()
except Exception as e:
    print(f"Error: {e}")
