import sqlite3
import os

def drop_all_tables():
    """Drop all tables in the database."""
    # Database file path
    db_path = os.path.join(os.path.dirname(__file__), 'sttm_db.db')
    
    # Connect to the database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Disable foreign key constraints temporarily
    cursor.execute("PRAGMA foreign_keys = OFF;")
    
    # Get all table names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    # Drop each table
    for table in tables:
        table_name = table[0]
        if table_name != 'sqlite_sequence':  # Skip the sqlite_sequence table
            cursor.execute(f"DROP TABLE IF EXISTS {table_name};")
            print(f"Dropped table: {table_name}")
    
    # Re-enable foreign key constraints
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # Commit changes and close connection
    conn.commit()
    conn.close()
    
    print("All tables have been dropped successfully!")

if __name__ == "__main__":
    drop_all_tables() 