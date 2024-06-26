class UserController {

    constructor(formId, formUpdateEl, tableId) {
        this.formCreateEl = document.getElementById(formId);
        this.formUpdateEl = document.getElementById(formUpdateEl);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();
        this.selectAll();
    }

    onEdit() {
        document.querySelector("#box-user-update .btn-cancel")
            .addEventListener("click", e => {
                this.ShowPanelCreate();
            });

        this.formUpdateEl.addEventListener("submit", event => {

            event.preventDefault();

            let btnSubmit = this.formUpdateEl.querySelector("[type=submit]");

            btnSubmit.disabled = true;

            let values = this.getValues(this.formUpdateEl);
            let index = this.formUpdateEl.dataset.trIndex;
            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);

            let result = Object.assign({}, userOld, values);

            this.getPhoto(this.formUpdateEl).then(
                (content) => {

                    if (!values.photo)
                        result._photo = userOld._photo;
                    else
                        result._photo = content;

                    let user = new User();

                    user.loadFromJSON(result)

                    this.getTr(user, tr);

                    this.updateCount();

                    this.formUpdateEl.reset()
                    btnSubmit.disabled = false;

                    this.ShowPanelCreate();
                },
                (e) => {
                    console.error(e);
                }
            );
        });
    }

    onSubmit() {
        this.formCreateEl.addEventListener("submit", event => {

            event.preventDefault();

            let btnSubmit = this.formCreateEl.querySelector("[type=submit]");

            btnSubmit.disabled = true;

            let values = this.getValues(this.formCreateEl);

            if (!values)
                return false;

            this.getPhoto(this.formCreateEl).then(
                (content) => {
                    values.photo = content;
                    this.insert(values);
                    this.addLine(values);
                    this.formCreateEl.reset()
                    btnSubmit.disabled = false;
                },
                (e) => {
                    console.error(e);
                }
            );
        })
    }

    getPhoto(formEl) {

        return new Promise((resolve, reject) => {
            let fileReader = new FileReader();

            let elements = [...formEl.elements].filter(item => {
                if (item.name === 'photo')
                    return item;
            });

            let file = elements[0].files[0];

            fileReader.onload = () => {
                resolve(fileReader.result);
            };

            fileReader.onerror = (e) => {
                reject(e);
            }

            if (file)
                fileReader.readAsDataURL(file);
            else
                resolve('dist/img/boxed-bg.jpg');
        });
    }

    getValues(formEl) {

        let user = {};

        let isValid = true;

        [...formEl.elements].forEach(function (field, index) {

            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {
                field.parentElement.classList.add('has-error');
                isValid = false;
            }

            if (field.name == "gender") {
                if (field.checked)
                    user[field.name] = field.value;
            }
            else if (field.name == "admin") {
                user[field.name] = field.checked;
            }
            else {
                user[field.name] = field.value;
            }
        })

        if (!isValid)
            return false;

        return new User(user.name, user.gender, user.birth, user.country,
            user.email, user.password, user.photo, user.admin);
    }

    getUsersStorage() {

        let users = [];
        if (localStorage.getItem("users"))
            users = JSON.parse(localStorage.getItem("users"));

        return users;
    }

    selectAll() {
        let users = this.getUsersStorage();

        users.forEach(dataUser => {

            let user = new User();

            user.loadFromJSON(dataUser);

            this.addLine(user)
        });

    }

    insert(data) {

        let users = this.getUsersStorage();

        users.push(data);

        localStorage.setItem("users", JSON.stringify(users));

    }

    addLine(dataUser) {

        let tr = this.getTr(dataUser);

        this.tableEl.appendChild(tr);

        this.updateCount()
    }

    getTr(dataUser, tr = null) {

        if (tr === null)
            tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML = `          
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin) ? 'Sim' : 'Não'} </td>
            <td>${Utils.dateFormat(dataUser.register)}</td>
            <td>
            <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
            <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>
        `;

        this.addEventsTR(tr);

        return tr;
    }

    addEventsTR(tr) {

        tr.querySelector(".btn-delete").addEventListener("click", e => {

            if (confirm("Deseja realmente excluir")) {
                tr.remove()
                this.updateCount();
            }
        });

        tr.querySelector(".btn-edit").addEventListener("click", e => {

            let json = JSON.parse(tr.dataset.user);

            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

            for (let name in json) {
                let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]");

                if (field) {

                    switch (field.type) {
                        case 'file':
                            continue;
                            break;

                        case 'radio':
                            field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]");
                            field.checked = true;
                            break;

                        case 'checkbox':
                            field.checked = json[name];
                            break;

                        default:
                            field.value = json[name];
                    }

                    field.value = json[name];
                }
            }

            this.formUpdateEl.querySelector(".photo").src = json._photo;
            this.ShowPanelUpdate();
        });
    }

    ShowPanelCreate() {
        document.querySelector("#box-user-create").style.display = "block";
        document.querySelector("#box-user-update").style.display = "none";
    }

    ShowPanelUpdate() {
        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";
    }

    updateCount() {

        let numberUsers = 0;
        let numberAdmin = 0;

        [...this.tableEl.children].forEach(tr => {
            numberUsers++;

            let user = JSON.parse(tr.dataset.user);

            if (user._admin)
                numberAdmin++;
        })

        document.querySelector("#numbers-users").innerHTML = numberUsers;
        document.querySelector("#numbers-users-admin").innerHTML = numberAdmin;
    }

}