class Student {
    constructor(fName = '', lName = '', info = '', id = -1){
        this.fName = fName;
        this.lName = lName;
        this.info = info;
        this.id = id;
        this.rowID = null;
    }

    getOutput(){
        return {
            fName : this.fName,
            lName : this.lName,
            allergies: this.info
        }
    }
}

module.exports = Student;