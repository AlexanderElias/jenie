
export default [
    {
        name: 'o-select',
        template: '<slot></slot>',
        attributes: [ 'multiple' ],
        style: 'o-select { display: block; }',
        created: function () {
            this.tabIndex = 0;
        },
        attributed: function (name) {
            switch (name) {
            case 'multiple': this.multiple = false; break;
            }
        },
        properties: {
            _options: { writable: true, value: [] },
            _selectedIndex: { writable: true, value: -1 },
            _selectedOptions: { writable: true, value: [] },
            options: {
                enumerable: true,
                get: function () {
                    return this._options;
                }
            },
            selectedOptions: {
                enumerable: true,
                get: function () {
                    return this._selectedOptions;
                }
            },
            selectedIndex: {
                enumerable: true,
                get: function () {
                    return this._options.indexOf(this._selectedOptions[0]);
                }
            },
            required: {
                enumerable: true,
                get: function () {
                    return this.hasAttribute('required');
                },
                set: function (data) {
                    data = data ? true : false;
                    if (data) this.setAttribute('required', '');
                    else this.removeAttribute('required');
                    return data;
                }
            },
            checkValidity: {
                enumerable: true,
                value: function () {
                    if (this.required) {
                        return this._selectedOptions.length ? true : false;
                    } else {
                        return true;
                    }
                }
            },
            type: {
                enumerable: true,
                get: function () {
                    return this.hasAttribute('multiple') ? 'select-multiple' : 'select-one';
                }
            },
            disabled: {
                enumerable: true,
                get: function () {
                    return this.hasAttribute('disabled');
                },
                set: function (data) {
                    data = data ? true : false;
                    if (data) this.setAttribute('disabled', '');
                    else this.removeAttribute('disabled');
                    return data;
                }
            },
            multiple: {
                enumerable: true,
                get: function () {
                    return this.hasAttribute('multiple');
                },
                set: function (data) {
                    data = data ? true : false;

                    if (data) {
                        this.setAttribute('multiple', '');
                    } else {
                        this.removeAttribute('multiple');
                        for (var i = 1; i < this._selectedOptions.length; i++) {
                            this._selectedOptions[i].selected = false;
                        }

                    }

                    return data;
                }
            },
            name: {
                enumerable: true,
                get: function () {
                    return this.getAttribute('name') || '';
                },
                set: function (data) {
                    this.setAttribute('name', data);
                    return data;
                }
            }
        }
    },
    {
        name: 'o-optgroup',
        attributes: [ 'label' ],
        template: '<slot></slot>',
        style: 'o-optgroup { display: block; } o-optgroup::before { content: attr(label); }',
        properties: {
            disabled: {
                enumerable: true,
                get: function () {
                    return this.hasAttribute('disabled');
                },
                set: function (data) {
                    data = data ? true : false;
                    if (data) this.setAttribute('disabled', '');
                    else this.removeAttribute('disabled');
                    return data;
                }
            },
            label: {
                enumerable: true,
                get: function () {
                    return this.getAttribute('label');
                },
                set: function (data) {
                    return this.setAttribute('label', data);
                }
            }
        },
        attributed: function (name, _, data) {
            switch (name) {
            case 'label': this.label = data; break;
            }
        },
        created: function () {
            if (this.parentElement && this.parentElement.nodeName !== 'O-SELECT') {
                console.warn('o-optgroup invalid parent element');
            }
        }
    },
    {
        name: 'o-option',
        template: '<slot></slot>',
        style: 'o-option { display: block; }',
        attributes: [ 'value' ],
        properties: {
            _value: { writable: true, value: '' },
            _group: { writable: true, value: null },
            _select: { writable: true, value: null },
            _selected: { writable: true, value: false },
            _valueDefaultLocked: { writable: true, value: false },
            _selectedDefaultLocked: { writable: true, value: false },
            select: {
                get: function () {
                    if (!this._select) {
                        if (!this.parentElement) {
                            return this._select = null;
                        } else if (this.parentElement.nodeName === 'O-SELECT') {
                            return this._select = this.parentElement;
                        } else if (!this.parentElement.parentElement) {
                            return this._select = null;
                        } else if (this.parentElement.parentElement.nodeName === 'O-SELECT') {
                            return this._select = this.parentElement.parentElement;
                        } else {
                            return null;
                        }
                    } else {
                        return this._select;
                    }
                }
            },
            group: {
                get: function () {
                    if (!this._group) {
                        if (!this.parentElement) {
                            return this._group = null;
                        } else if (this.parentElement.nodeName === 'O-OPTGROUP') {
                            return this._group = this.parentElement;
                        }
                    } else {
                        return this._group;
                    }
                }
            },
            value: {
                enumerable: true,
                get: function () {
                    if (this._valueDefaultLocked) {
                        return this._value || this.textContent || '';
                    } else {
                        var value = this.getAttribute('value');
                        return value || this._value || this.textContent || '';
                    }
                },
                set: function (data) {
                    this._valueDefaultLocked = true;
                    return this._value = data === null || data === undefined ? '' : data;
                }
            },
            selected: {
                enumerable: true,
                get: function () {
                    // if (this._selectedDefaultLocked) {
                    return this._selected;
                    // } else {
                    //     var selected = this.getAttribute('selected');
                    //     return selected !== null && selected !== 'false' ? true : false;
                    // }
                },
                set: function (data) {
                    console.log('set');
                    this._selectedDefaultLocked = true;

                    var selected = this._selected = data ? true : false;
                    if (selected) this.setAttribute('active', '');
                    else this.removeAttribute('active');

                    var select = this.select;
                    if (!select) return selected;

                    var multiple = select.multiple;
                    var selectedOptions = select._selectedOptions;

                    if (!multiple && selectedOptions[0]) {
                        if (selectedOptions[0] === this) {
                            return selected;
                        } else {
                            selectedOptions[0].removeAttribute('active');
                            selectedOptions[0]._selected = false;
                            selectedOptions.splice(0, 1);
                        }
                    }

                    var index = selectedOptions.indexOf(this);

                    if (selected) {
                        if (index === -1) {
                            selectedOptions.push(this);
                            this.setAttribute('active', '');
                        }
                    } else {
                        if (index !== -1) {
                            selectedOptions.splice(index, 1);
                            this.removeAttribute('active');
                        }
                    }

                    return selected;
                }
            },
            disabled: {
                enumerable: true,
                get: function () {
                    return this.hasAttribute('disabled');
                },
                set: function (data) {
                    data = data ? true : false;
                    if (data) this.setAttribute('disabled', '');
                    else this.removeAttribute('disabled');
                    return data;
                }
            },
            name: {
                enumerable: true,
                get: function () {
                    return this.getAttribute('name') || '';
                },
                set: function (data) {
                    this.setAttribute('name', data);
                    return data;
                }
            },
            _click: {
                enumerable: true,
                value: function () {
                    if (
                        this.disabled ||
                        (this.select && this.select.disabled) ||
                        (this.group && this.group.disabled)
                    ) return;

                    this.selected = !this.selected;
                    this.select.dispatchEvent(new window.Event('change'));
                    this.select.dispatchEvent(new window.Event('input'));
                }
            }
        },
        attributed: function (name, _, data) {
            switch (name) {
            case 'value': this._value = data || ''; break;
            }
        },
        attached: function () {

            if (this.select) {
                this.select._options.push(this);
                // this.selected = this.selected ? true : false;
            }

            // if (this.hasAttribute('selected')) {
            //     this.setAttribute('active', '');
            // } else {
            //     this.removeAttribute('active');
            // }

        },
        detached: function () {
            console.log('detached');
            if (this.select) {
                this.selected = false;
                this.select._options.splice(this.select._options.indexOf(this), 1);
                this._select = null;
            }
        },
        created: function () {
            this.onclick = this._click;
        }
    }
];
