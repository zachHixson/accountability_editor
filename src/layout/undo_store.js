class UndoStore{
    constructor(){
        this.history = [];
        this.redoHistory = [];
        this.freeze = false;
    }

    commit(taskName, data, action, inverseAction){
        let commit = {taskName, data, action, inverseAction};
        commit.action(data);
        this.redoHistory = [];

        if (this.history.length > 50){
            this.history.shift();
        }

        if (!this.freeze){
            this.history.push(commit)
        }
    }

    undo(){
        this.freeze = true;

        if (this.history.length > 0){
            let prevCommit = this.history.pop();
            prevCommit.inverseAction(prevCommit.data);
            this.redoHistory.push(prevCommit);
        }

        this.freeze = false;
    }

    redo(){
        this.freeze = true;

        if (this.redoHistory.length > 0){
            let redoCommit = this.redoHistory.pop();
            redoCommit.action(redoCommit.data);
            this.history.push(redoCommit);
        }

        this.freeze = false;
    }
}

module.exports = UndoStore;