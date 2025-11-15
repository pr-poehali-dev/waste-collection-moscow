import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get all waste categories from database
    Args: event - dict with httpMethod
          context - object with request_id attribute
    Returns: HTTP response with list of waste categories
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    database_url = os.environ.get('DATABASE_URL')
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    query = '''
        SELECT wc.id, wc.code, wc.name, wc.icon, wc.color, wc.description,
               COUNT(DISTINCT pc.point_id) as points_count
        FROM waste_categories wc
        LEFT JOIN point_categories pc ON wc.id = pc.category_id
        GROUP BY wc.id, wc.code, wc.name, wc.icon, wc.color, wc.description
        ORDER BY wc.name
    '''
    
    cur.execute(query)
    rows = cur.fetchall()
    
    categories = []
    for row in rows:
        categories.append({
            'id': row[0],
            'code': row[1],
            'name': row[2],
            'icon': row[3],
            'color': row[4],
            'description': row[5],
            'pointsCount': row[6]
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'categories': categories}, ensure_ascii=False)
    }
