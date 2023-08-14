import json
import pymongo
from pymongo import MongoClient


client = pymongo.MongoClient("mongodb+srv://khdJJuM2qgRck8eu:khdJJuM2qgRck8eu@shopello.tsvz3ld.mongodb.net/")
db = client['flipclone']
collection = db['products']


with open('data.json', encoding="utf8") as f:
    data = json.load(f)

for i in range(len(data)):
    foramtted_title = {
        "shortTitle": data[i]['title'],
        "longTitle": data[i]['tagline']
    }
    formatted_price= {
        "mrp": data[i]['price'],
        "cost": data[i]['price']/2,
        "discount": data[i]['discount']
    }
    formatted_data = {
        "title": foramtted_title,
        "price": formatted_price,
        "description": data[i]['description'] if 'description' in data[i] else None,
        "discount": 'Upto '+str(data[i]['discount'])+'% Off' if 'discount' in data[i] else None,
        "tagline": 'Grab this deal',
        "url": data[i]['image'],
        "detailUrl": data[i]['image'],
        "qty": data[i]['count_in_stock']
    }
    print(formatted_data)
    collection.insert_one(formatted_data)



# close connection
client.close()