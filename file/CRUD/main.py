import sqlite3
from flask import Flask, render_template, request


db = sqlite3.connect('crud.db', check_same_thread=False)
cur = db.cursor()
app = Flask(__name__)

def initiate():
   
    create_table_query = '''
        CREATE TABLE IF NOT EXISTS `STUDENTS` (
            `ROLL_NO` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            `NAME` VARCHAR(255),
            `DEPARTMENT` VARCHAR(255)
        )
    '''
    cur.execute(create_table_query)
    db.commit()

    app.run()

@app.route('/create', methods=["POST"])
def create():
    insert_query = '''
        INSERT INTO STUDENTS(NAME,DEPARTMENT) VALUES(?, ?)
    '''

    data = request.get_json()

    if(not data.get("name") or len(data.get("name","")) == 0):
        return {
            "status": "error",
            "message": "name is required"
        }

    if(not data.get("department") or len(data.get("department","")) == 0):
        return {
            "status": "error",
            "message": "department is required"
        }
    
    cur.execute(insert_query,[data["name"],data["department"]])
    db.commit()

    data = {
        "status": "success",
        "data": data,
        "message": "Student created successfully"
    }

    return data

@app.route('/read', methods=["GET"])
def read_all():
    read_query = "SELECT * FROM STUDENTS"
    res = cur.execute(read_query).fetchall()

    resp = {
        "status": "success",
        "data": res
    }

    return resp

@app.route('/read/<int:roll_no>', methods=["GET"])
def read(roll_no):
    read_query = "SELECT * FROM STUDENTS WHERE ROLL_NO = ?"
    res = cur.execute(read_query,[roll_no]).fetchall()

    if(len(res) > 0):
        resp = {
            "status": "success",
            "data": res[0]
        }
    else:
       resp = {
        "status": "error",
        "message": "No such student"
       }
    
    return resp

@app.route('/update', methods=["PUT"])
def update():
    update_query = '''
        UPDATE STUDENTS SET NAME = ?, DEPARTMENT = ? WHERE ROLL_NO = ?
    '''

    data = request.get_json()

    if(not data.get("name") or len(data.get("name","")) == 0):
        return {
            "status": "error",
            "message": "name is required"
        }

    if(not data.get("department") or len(data.get("department","")) == 0):
        return {
            "status": "error",
            "message": "department is required"
        }
    
    if(not data.get("roll_no") or len(str(data.get("roll_no",""))) == 0):
        return {
            "status": "error",
            "message": "roll_no is required"
        }

    cur.execute(update_query,[data["name"],data["department"],data["roll_no"]])
    db.commit()

    data = {
        "status": "success",
        "data": data,
        "message": "Student updated successfully"
    }

    return data

@app.route('/delete',methods=["DELETE"])
def delete():
    delete_query = '''
        DELETE FROM STUDENTS WHERE ROLL_NO = ?
    '''

    data = request.get_json()

    if(not data.get("roll_no") or len(str(data.get("roll_no",""))) == 0):
        return {
            "status": "error",
            "message": "roll_no is required"
        }

    cur.execute(delete_query,[data["roll_no"]])
    db.commit()

    data = {
        "status": "success",
        "data": data,
        "message": "Student deleted successfully"
    }

    return data

@app.route('/', methods=["GET"])
def home():
   return render_template('./index.html')

if __name__ == '__main__':
   initiate()