import json
import os
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field, EmailStr, field_validator
import psycopg2

class SuggestionRequest(BaseModel):
    category_id: int = Field(..., gt=0)
    name: str = Field(..., min_length=2, max_length=255)
    address: str = Field(..., min_length=5, max_length=500)
    metro: Optional[str] = Field(None, max_length=100)
    hours: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[EmailStr] = None
    user_name: Optional[str] = Field(None, max_length=100)
    user_contact: Optional[str] = Field(None, max_length=100)
    comment: Optional[str] = None
    
    @field_validator('name', 'address')
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return v.strip()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для приёма предложений новых пунктов сбора отходов от пользователей.
    Принимает POST запросы с данными о пункте и сохраняет в базу данных.
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    suggestion = SuggestionRequest(**body_data)
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Database configuration error'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    try:
        cur = conn.cursor()
        
        def escape_sql(val):
            if val is None:
                return 'NULL'
            return "'" + str(val).replace("'", "''") + "'"
        
        metro_val = escape_sql(suggestion.metro)
        hours_val = escape_sql(suggestion.hours)
        phone_val = escape_sql(suggestion.phone)
        email_val = escape_sql(suggestion.email)
        user_name_val = escape_sql(suggestion.user_name)
        user_contact_val = escape_sql(suggestion.user_contact)
        comment_val = escape_sql(suggestion.comment)
        
        query = f'''
            INSERT INTO t_p52456942_waste_collection_mos.suggestions 
            (category_id, name, address, metro, hours, phone, email, user_name, user_contact, comment, status)
            VALUES (
                {suggestion.category_id}, 
                '{suggestion.name.replace("'", "''")}', 
                '{suggestion.address.replace("'", "''")}',
                {metro_val},
                {hours_val},
                {phone_val},
                {email_val},
                {user_name_val},
                {user_contact_val},
                {comment_val},
                'pending'
            )
            RETURNING id, created_at
        '''
        
        cur.execute(query)
        result = cur.fetchone()
        conn.commit()
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'id': result[0],
                'created_at': result[1].isoformat(),
                'message': 'Спасибо! Ваше предложение принято на рассмотрение.'
            }),
            'isBase64Encoded': False
        }
    finally:
        conn.close()