import psycopg2
import os

db_url = 'postgresql://neondb_owner:npg_Bvn2m4UuKJZe@ep-lively-butterfly-abin2yc4-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    query = """
    SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='natal_charts';
    """
    
    cur.execute(query)
    rows = cur.fetchall()
    
    print("Constraints for 'natal_charts':")
    for row in rows:
        print(f"Column: {row[1]} -> Table: {row[2]} (Column: {row[3]})")
        
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
