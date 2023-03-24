from utils import client

class User:
    def __init__(self,name,email,password):
        self.name = name
        self.email = email
        self.password = password

    def save(self):
        client.test.insert_one({
            'name': self.name,
            'email': self.email,
            'password': self.password
        })
