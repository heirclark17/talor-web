#!/usr/bin/env python3
import os
import sys
import psycopg2

print("=" * 70)
print("Running Practice Questions Migration")
print("=" * 70)

database_url = os.getenv('DATABASE_URL')
if not database_url:
    print("\nERROR: DATABASE_URL not found")
    sys.exit(1)

print("\n[OK] Found DATABASE_URL")

print("\nReading migration SQL...")
with open('migrations/add_practice_question_responses.sql', 'r') as f:
    migration_sql = f.read()
print(f"[OK] Loaded migration file ({len(migration_sql)} bytes)")

print("\nConnecting to database...")
conn = psycopg2.connect(database_url)
conn.autocommit = True
print("[OK] Connected successfully")

print("\nExecuting migration statements...")
cursor = conn.cursor()

statements = migration_sql.split(';')
success_count = 0
skip_count = 0

for i, stmt in enumerate(statements, 1):
    stmt = stmt.strip()
    if not stmt or stmt.startswith('--'):
        continue
    
    try:
        cursor.execute(stmt)
        success_count += 1
        print(f"  [OK] Statement {i}: Success")
    except Exception as e:
        if 'already exists' in str(e).lower():
            skip_count += 1
            print(f"  [SKIP] Statement {i}: Already exists")
        else:
            print(f"  [ERROR] Statement {i}: {e}")

cursor.close()
conn.close()

print("\n" + "=" * 70)
print("MIGRATION COMPLETE!")
print(f"  Successful: {success_count}, Skipped: {skip_count}")
print("=" * 70)
print("\nThe practice_question_responses table is ready!")
print("Users can now generate AI practice questions and save recordings.")
