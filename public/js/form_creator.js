function FormCreator(formClass, formName, method, action, x, y) {
    this.form = document.createElement('form');

    var thisForm = this.form;
    if(x && y) {
        thisForm.style.left = x+'px';
        thisForm.style.top = y+'px';
    }
    thisForm.setAttribute('class', formClass);
    thisForm.setAttribute('name', formName);
    thisForm.setAttribute('method', method);
    thisForm.setAttribute('action', action);
}

FormCreator.prototype.addInput = function(type, name, value, onClick) {
    var i = document.createElement("input");
    i.setAttribute("type", type);
    i.setAttribute("name", name);
    i.setAttribute("value", value);
    i.setAttribute("onClick", onClick);
    if(type === "text") {
        i.setAttribute("onFocus", "if(this.value ==='" + value + "') this.value = '';" );
        i.setAttribute("onBlur", "if(!this.value) this.value='" + value + "';");
    }

    this.form.appendChild(i);
};

FormCreator.prototype.addSelect = function(options, size, name) {
    var select = document.createElement("select");
    if(size) select.setAttribute("size", size);
    if(name) select.setAttribute("name", name);

    for(var i = 0; i < options.length; i++) {
        var option = document.createElement("option");
        option.setAttribute('value', options[i].value);
        option.innerHTML = options[i].label;
        select.appendChild(option);
    }

    this.form.appendChild(select);
};

FormCreator.prototype.addHTML = function(html) {
    this.form.innerHTML += html;
};

FormCreator.prototype.setCoordinate = function(x, y) {
    this.form.style.left = x + 'px';
    this.form.style.top = y + 'px';
};

FormCreator.prototype.removeForm = function(form) {
    document.getElementsByName(form.getAttribute('name'))[0].remove();
};