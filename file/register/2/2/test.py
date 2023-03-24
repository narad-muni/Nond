import db as dbb

db = dbb.dbase()
    
class User:
    def __init__(self,name,email,password) -> None:
        self.name = name
        self.email = email
        self.password = password

    def save(self):
        col = db['user']
        col.insert_one({
            'name':self.name,
            'email':self.email,
            'password':self.password,
        })