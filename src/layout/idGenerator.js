class IDGenerator{
    constructor(){
        this.wheel = 0;
    }

    newID(){
        return this.wheel++;
    }
}

module.exports = IDGenerator;