const DisplayModule = (() => {
    
    const getScreenReferences = () => {
        return {
            static: {
                listContainer: document.querySelector('[data-lists]')
            },
            interact: {
                newListForm: document.querySelector('[data-new-list-form]'),
                newListInput: document.querySelector('[data-new-list-input]')
            }
        }
    }

    let screenReferences = getScreenReferences();

    const clearElement = (element) => {
        while(element.firstChild) {
            element.removeChild(element.firstChild);
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
        selectList: event => {
            // if user clicks a list
            if(event.target.tagName.toLowerCase() == "li") {
                selectedListId = event.target.dataset.listId;
            }
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

        // add Event Listeners to statics
        screenReferences.static.listContainer.addEventListener('click', selectList);

        // Return for later usage
        return screenReferences;
    }

    const render = () => {
        // ask logic => give me list of lists
        let lists = logic.getLists();

        // send to display
        display.renderLists(lists, LSshorthands);
    }

    const save = () => {
        logic.saveLists();
        logic.saveSelected();
    }

    const actionComplete = () => {
        save();
        render();
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

    const selectList = event => {

        // ask logic => save in storage the selected list
        logic.selectList(event);

        // Action Complete
        actionComplete();
    }

    const createList = name => {
        return {
            id: Date.now().toString(),
            name,
            tasks: []
        }
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