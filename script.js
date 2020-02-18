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
        renderLists: (lists) => {
            // delete from container all obsolete elements
            clearElement(screenReferences.static.listContainer);

            // re-enter the updated list
            lists.forEach(list => {
                const listElement = document.createElement('li');
                listElement.dataset.listId = list.id;
                listElement.classList.add('list-name');
                listElement.innerText = list.name;

                screenReferences.static.listContainer.appendChild(listElement);
            });
        }
    }

})();

const LogicModule = (() => {

    const LS_LIST_KEY = "list.list"; // list of lists

    let lists = JSON.parse(localStorage.getItem(LS_LIST_KEY)) || []; // loon in storage, otherwise empty array

return {
        test: () => 'operative',
        getLists: () => lists,
        addNewList: newList => {
            lists.push(newList);
        },
        saveLists: () => {
            localStorage.setItem(LS_LIST_KEY, JSON.stringify(lists));
        }
    }

})();

const ControllerModule = ((display, logic) => {

    const setupEventListeners = () => {
        const screenReferences = display.getScreenReferences();

        // add Event Listeners to interactables
        screenReferences.interact.newListForm.addEventListener('submit', addNewList);

        // Return for later usage
        return screenReferences;
    }

    const render = () => {
        // ask logic => give me list of lists
        let lists = logic.getLists();

        // send to display
        display.renderLists(lists);
    }

    const save = () => {
        logic.saveLists();
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
        }
    }
})(DisplayModule, LogicModule);

ControllerModule.init();