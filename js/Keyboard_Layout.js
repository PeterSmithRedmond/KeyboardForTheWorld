// Defines how the keyboard should be layed out.
// IndentRow is the indentation for each row.
// Size00 is the size of the leftmost key
// This layoout is inspired my my Microsoft keyboard.
KeyboardLayout = {
    getLayout(iso) {
        let rowname = iso.charAt(0);
        return this[rowname];
    },
    getWidth(to) {
        let includes = Object.keys(this.keyWidths).includes(to);
        if (includes) {
            return this.keyWidths[to];
        }
        return 1.0;
    },

    "keyWidths": {
        " ": 5.5
    },

    "A": {
        IndentRow: 0,
        Size00 : 1.4
    },
    "B": {
        IndentRow: 0,
        Size00 : 1.6
    },
    "C": {
        IndentRow: 0,
        Size00 : 1.2
    },
    "D": {
        IndentRow: 0,
        Size00 : 1.0
    },
    "E": {
        IndentRow: 0,
        Size00 : .8
    },
    "F": {
        IndentRow: 0,
        Size00 : 1.0
    }
};