const DisplayModule = (() => {
    
    const getScreenReferences = () => {
        return {
            static: {
                listContainer: document.querySelector('[data-lists]'),
                taskContainer: document.querySelector('[data-list-display-container'),
                listTitle: document.querySelector('[data-list-title]'),
                listCount: document.querySelector('[data-list-count]')
            },
            interact: {
                newListForm: document.querySelector('[data-new-list-form]'),
                newTaskForm: document.querySelector('[data-new-task-form]'),
                newListInput: document.querySelector('[data-new-list-input]'),
                newTaskInput: document.querySelector('[data-new-task-input]'),
                deleteListButton: document.querySelector('[data-delete-list-button')
            }
        }
    }

    let screenReferences = getScreenReferences();

    const clearElement = (element) => {
        while(element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    const calculateTasksCount = list => {
        // find how many tasks are left
        const incompleteTasks = list.tasks.filter(task => !task.complete).length;
        const s = incompleteTasks == 1 ? "" : "s";
        return {
            n: incompleteTasks,
            s
        }
    }

return {
        test: () => 'operative',
        getScreenReferences: () => screenReferences,
        renderLists: (lists, shorthands) => {
            // delete from container all obsolete elements
            clearElement(screenReferences.static.listContainer);

            // re-enter the updated list
            lists.forEach(list => {
                const listElement = document.createElement('li');
                listElement.dataset.listId = list.id;
                listElement.classList.add('list-name');

                // check if this "list" is the selected one
                if(list.id === localStorage.getItem(shorthands.LS_SELECTED_LIST_ID_KEY)) {
                    listElement.classList.add('selected');
                    listElement.innerText = list.name.toUpperCase();
                } else {
                    listElement.innerText = list.name;
                }
                
                // add new list child
                screenReferences.static.listContainer.appendChild(listElement);
            });
        },
        renderTasks: (lists, shorthands, references) => {
            // head of task container
            const selectedListId = localStorage.getItem(shorthands.LS_SELECTED_LIST_ID_KEY);
            const selectedElement = lists.find(list => list.id == selectedListId);

            if(selectedElement == undefined) {
                // thus, at start || after deleting a list
                console.log(references);
                references.static.taskContainer.style.display = "none";
            } else {
                // if find an element to display
                references.static.taskContainer.style.display = ""; // reverse to previous
                
                // put the name of the list on label
                references.static.listTitle.innerText = selectedElement.name.toUpperCase();
                
                // calculate how many task left-overs
                const taskCount = calculateTasksCount(selectedElement);
                references.static.listCount.innerText = taskCount.n + " task" + taskCount.s + " left"
            
            // body of task container
                // delete from container all old tasks
                clearElement(screenReferences.static.taskContainer);

                // write again all tasks of the selected list
                selectedElement.tasks.forEach(task => {
                    const taskElement = document.importNode(template.content, true);
                    const checkbox = taskElement.querySelector('input');
                    checkbox.id = task.id;
                    checkbox.checked = task.complete;
                    const label = taskElement.querySelector('label');
                    label.htmlFor = task.id;
                    label.append(task.name);

                    screenReferences.static.taskContainer.appendChild(taskElement);
                })
            }
        }
    }

})();

// ##############################################################################################

const LogicModule = (() => {

    const LS_LIST_KEY = "list.list"; // list of lists
    const LS_SELECTED_LIST_ID_KEY = "list.selectedListId";

    let lists = JSON.parse(localStorage.getItem(LS_LIST_KEY)) || []; // loon in storage, otherwise empty array
    let selectedListId = localStorage.getItem(LS_SELECTED_LIST_ID_KEY);

return {
        test: () => 'operative',
        getLists: () => lists,
        getLSshorthands: () => {
            return {
                LS_LIST_KEY,
                LS_SELECTED_LIST_ID_KEY
            }
        },
        addNewList: newList => {
            lists.push(newList);
        },
        saveLists: () => {
            localStorage.setItem(LS_LIST_KEY, JSON.stringify(lists));
        },
        saveSelected: () => {
            localStorage.setItem(LS_SELECTED_LIST_ID_KEY, selectedListId);

        },
        deleteList: event => {
            // overdrive lists with lists - list deleted
            lists = lists.filter(list => list.id !== selectedListId);

            // no more selected list
            selectedListId = null;


        },
        selectList: event => {
            // if user clicks a list
            if(event.target.tagName.toLowerCase() == "li") {
                selectedListId = event.target.dataset.listId;
            }
        },
        addTask: task => {
            const selectedList = lists.find(list => list.id === selectedListId);
            selectedList.tasks.push(task);
        }
    }

})();

// ##############################################################################################

const ControllerModule = ((display, logic) => {

    // ask logic => get shorthands for localstorage
    const LSshorthands = logic.getLSshorthands();

    const setupEventListeners = () => {
        const screenReferences = display.getScreenReferences();

        // add Event Listeners to interactables
        screenReferences.interact.newListForm.addEventListener('submit', addNewList);
        screenReferences.interact.newTaskForm.addEventListener('submit', addNewTask);
        screenReferences.interact.deleteListButton.addEventListener('click', deleteList);

        // add Event Listeners to statics
        screenReferences.static.listContainer.addEventListener('click', selectList);

        // Return for later usage
        return screenReferences;
    }

    const render = () => {
        // take the references
        const screenReferences = setupEventListeners();

        // ask logic => give me list of lists
        let lists = logic.getLists();

        // send to display
        display.renderLists(lists, LSshorthands);
        display.renderTasks(lists, LSshorthands, screenReferences);
    }

    const save = () => {
        logic.saveLists();
        logic.saveSelected();
    }

    const actionComplete = () => {
        render();
        save();
    }

    const addNewList = event => {
        // prevent the default refreshing of the page due to form submit
        event.preventDefault();

        // take the references
        const screenReferences = setupEventListeners();

        // get & check the user's new list name
        const listName = screenReferences.interact.newListInput.value;
        if(listName == null || listName == "") return;

        // build the object
        const list = createList(listName);

        // askLogic => push the listItem in the listArray
        logic.addNewList(list);

        // clean up the form
        screenReferences.interact.newListInput.value = "";

        // Action Complete
        actionComplete();
    }

    const addNewTask = () => {
        event.preventDefault();
        const screenReferences = setupEventListeners();
        const taskName = screenReferences.interact.newTaskInput.value;
        if(taskName == null || taskName == "") return;

        // build the task
        const task = createTask(taskName);

        screenReferences.interact.newTaskInput.value = "";

        // ask logic => add task to this list
        logic.addTask(task);

        actionComplete();
    }

    const deleteList = event => {
        // ask logic => delete the list from list of lists
        logic.deleteList();

        actionComplete();
    }

    const selectList = event => {

        // ask logic => save in storage the selected list
        logic.selectList(event);

        // Action Complete
        actionComplete();
    }

    const createList = name => {
        return {
            id: buildRandomId(),
            name,
            tasks: [
                {
                    id: buildRandomId(),
                    name: 'never surrender',
                    complete: false
                    }
            ]
        }
    }

    const createTask = name => {
        return {
            id: buildRandomId(),
            name,
            complete: false
        }
    }

    const buildRandomId = () => {
        return Date.now().toString();
    }


    return {
        test: () => {
            console.log('DisplayModule: ' + display.test() + '\nLogicModule: ' + logic.test())
        },
        init: () => {
            setupEventListeners();
            render();
            console.log('App started successfully.')
        },
        showReferences: () => {
            console.log(setupEventListeners());
        }
    }
})(DisplayModule, LogicModule);

ControllerModule.init();