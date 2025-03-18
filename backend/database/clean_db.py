import sqlite3
import os

def clean_database():
    """Clean out all tables in the database by deleting all records."""
    # Database file path
    db_path = os.path.join(os.path.dirname(__file__), 'sttm_db.db')
    
    # Connect to the database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get all table names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    # Delete all records from each table
    for table in tables:
        table_name = table[0]
        if table_name != 'sqlite_sequence':  # Skip the sqlite_sequence table
            cursor.execute(f"DELETE FROM {table_name};")
            print(f"Deleted all records from table: {table_name}")
    
    # Reset the auto-increment counters
    cursor.execute("DELETE FROM sqlite_sequence;")
    
    # Commit changes and close connection
    conn.commit()
    conn.close()
    
    print("Database cleaned successfully!")

if __name__ == "__main__":
    clean_database() 