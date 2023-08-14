import json
import pymongo
from pymongo import MongoClient


client = pymongo.MongoClient("mongodb+srv://khdJJuM2qgRck8eu:khdJJuM2qgRck8eu@shopello.tsvz3ld.mongodb.net/")
db = client['flipclone']
collection = db['products']

# read data.json
with open('data.json') as f:
    print(f)
    data = json.load(f)

for i in range(len(data)):
    formatted_data = {
        "title": data[i]['title'],
        "price": data[i]['price'],
        "description": data[i]['description'] if 'description' in data[i] else None,
        "discount": data[i]['discount'],
        "tagline": data[i]['tagline'],
        "url": data[i]['url'],
        "detailUrl": data[i]['detailUrl'],
        "qty": data[i]['qty']
    }
    print(formatted_data)
    collection.insert_one(formatted_data)



# close connection
client.close()