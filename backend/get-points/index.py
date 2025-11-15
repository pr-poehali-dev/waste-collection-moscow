import json
import os
import psycopg2
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get waste collection points from database with optional filtering
    Args: event - dict with httpMethod, queryStringParameters (category_id, search)
          context - object with request_id attribute
    Returns: HTTP response with list of collection points
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
    
    params = event.get('queryStringParameters', {}) or {}
    category_id = params.get('category_id')
    search = params.get('search', '').strip().lower()
    
    database_url = os.environ.get('DATABASE_URL')
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    if category_id:
        query = '''
            SELECT DISTINCT cp.id, cp.name, cp.address, cp.metro, cp.latitude, cp.longitude, cp.hours, cp.phone,
                   wc.id as category_id, wc.code, wc.name as category_name, wc.icon, wc.color, wc.description
            FROM collection_points cp
            JOIN point_categories pc ON cp.id = pc.point_id
            JOIN waste_categories wc ON pc.category_id = wc.id
            WHERE wc.id = ''' + str(int(category_id)) + '''
            ORDER BY cp.name
        '''
    else:
        query = '''
            SELECT cp.id, cp.name, cp.address, cp.metro, cp.latitude, cp.longitude, cp.hours, cp.phone,
                   wc.id as category_id, wc.code, wc.name as category_name, wc.icon, wc.color, wc.description
            FROM collection_points cp
            JOIN point_categories pc ON cp.id = pc.point_id
            JOIN waste_categories wc ON pc.category_id = wc.id
            ORDER BY cp.name, wc.name
        '''
    
    cur.execute(query)
    rows = cur.fetchall()
    
    points_dict = {}
    for row in rows:
        point_id = row[0]
        if point_id not in points_dict:
            points_dict[point_id] = {
                'id': row[0],
                'name': row[1],
                'address': row[2],
                'metro': row[3],
                'latitude': float(row[4]) if row[4] else None,
                'longitude': float(row[5]) if row[5] else None,
                'hours': row[6],
                'phone': row[7],
                'categories': []
            }
        
        points_dict[point_id]['categories'].append({
            'id': row[8],
            'code': row[9],
            'name': row[10],
            'icon': row[11],
            'color': row[12],
            'description': row[13]
        })
    
    points = list(points_dict.values())
    
    if search:
        points = [
            p for p in points 
            if search in p['name'].lower() 
            or search in p['address'].lower() 
            or (p['metro'] and search in p['metro'].lower())
        ]
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'points': points}, ensure_ascii=False)
    }
