class UndoStore{
    constructor(){
        this.history = [];
        this.redoHistory = [];
    }

    commit(taskName, state){
        let newCommit = {taskName, state};
        this.history.push(newCommit);
        this.redoHistory = [];

        if (this.history.length > 20){
            this.history.shift();
        }
    }

    undo(){
        if (this.history.length > 0){
            let prevCommit = this.history.pop();
            this.redoHistory.push(prevCommit);
            return prevCommit.state;
        }

        return null;
    }

    redo(){
        if (this.redoHistory.length > 0){
            let nextCommit = this.redoHistory.pop();
            this.history.push(nextCommit);
            return nextCommit.state;
        }

        return null;
    }
}

module.exports = UndoStore;