var title = 'Class Binder';
var name = 'r-binder-class';

var model = {
    ca: false,
    c: 'default',
    title: 'Class',

    toggle: function () {
        this.model.ca = !this.model.ca;
    },

    overwrite: function () {
        this.model.c = 'overwrite';
    }

};

var style = /*css*/`
    .default {
        border: solid 0.3rem black;
    }
    .overwrite {
        border: solid 0.3rem red;
    }
    .active {
        background: lightgray;
    }
`;

var template = /*html*/`
    <h2>{{title}}</h2>
    <hr>

    <br>
    <br>
    <div o-class="c">o-class="{{c}}"</div>
    <button o-on-click="overwrite">Overwrite Class</button>

    <br>
    <br>
    <div class="default" o-class-active="ca">o-class-active="{{ca}}"</div>
    <button o-on-click="toggle">Toggle Class</button>
`;

export default {
    title, name, model, style, template,
    // methods: {}
};
