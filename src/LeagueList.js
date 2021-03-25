import React, { Component } from 'react';
// import ReactDOM from 'react-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios'
import Button from 'react-bootstrap/lib/Button'
import Modal from "react-modal"
import db from './firebaseconfig'

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};


/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    padding: grid,
    margin: `0 0 ${grid * .75}px 0`,

    // change background colour if dragging
    background: isDragging ? '#faf7f0' : '#bababa',
    borderRadius: '5px',

    // styles we need to apply on draggables
    ...draggableStyle
});

const getListStyle = (isDraggingOver, color) => ({
    background: isDraggingOver ? '#263e69' : '#172B4D',
    padding: grid,
    width: 250,
    margin: '20px 50px 50px 50px',
    borderRadius: '3px'
});

const getButtonStyle = (color) => ({
    padding: grid,
    backgroundColor: color,
    margin: '25px 100px 0px 100px',
    width: 150
});


const getDivStyle = () => ({
    display: 'flex',
    justifyContent: 'center'
    // padding: 100
});


export default class LeagueList extends Component {

    toggleResetModal() {
        this.setState({ resetModelEnabled: !this.state.resetModelEnabled })
    }

    toggleSubmitModal() {
        this.setState({ submitModalEnabled: !this.state.submitModalEnabled })
    }

    submit() {
        console.log(this.state.inputValue)
        console.log(this.state.items.map(item => item.content))
        console.log(process.env.APP_ID)


        db.collection("champs").doc(this.state.inputValue).set({
            champs: this.state.items.map(item => item.content)
        })
            .then(() => {
                console.log("Document written");
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            })
    }


    //Function which is called when the component loads for the first time
    componentDidMount() {
        this.getLeagueChamps()
    }

    //Function to Load the customerdetails data from json.
    getLeagueChamps() {
        axios.get('assets/samplejson/champions.txt').then(response => {


            const items = String(response.data).split('\n')

            // items.map(value, index => )

            const champItems = items.map((value, index) => ({
                id: `item-${index}`,
                content: value
            }))


            this.setState({
                items: [],
                selected: champItems
            })
        })
    };

    state = {
        items: [],
        selected: [],
        resetModelEnabled: false,
        submitModalEnabled: false,
        inputValue: '',
        submitEnabled: false
    };




    /**
     * A semi-generic way to handle multiple lists. Matches
     * the IDs of the droppable container to the names of the
     * source arrays stored in the state.
     */
    id2List = {
        droppable: 'items',
        droppable2: 'selected'
    };

    getList = id => this.state[this.id2List[id]];

    onDragEnd = result => {
        const { source, destination } = result;

        // dropped outside the list
        if (!destination) {
            return;
        }

        if (source.droppableId === destination.droppableId) {
            const items = reorder(
                this.getList(source.droppableId),
                source.index,
                destination.index
            );

            let state = { items };

            if (source.droppableId === 'droppable2') {
                state = { selected: items };
            }

            this.setState(state);
        } else {
            const result = move(
                this.getList(source.droppableId),
                this.getList(destination.droppableId),
                source,
                destination
            );

            this.setState({
                items: result.droppable,
                selected: result.droppable2
            });
        }

    };


    updateInputValue(evt) {
        this.setState({
            inputValue: evt.target.value
        });
    }

    // Normally you would want to split things out into separate components.
    // But in this example everything is just done in one place for simplicity
    render() {
        return (

            <div>
                <div>
                    <Button
                        disabled={this.state.selected.length !== 0}
                        bsStyle="info" onClick={() => this.toggleSubmitModal()} style={getButtonStyle('green')}>
                        Submit
                    </Button>
                    <Button bsStyle="info" onClick={() => this.toggleResetModal()} style={getButtonStyle('#ba1e1e')}>
                        Reset lists
                    </Button>
                    <Modal
                        ariaHideApp={false}
                        isOpen={this.state.resetModelEnabled}
                        contentLabel="Reset modal"
                        className="mymodal"
                        overlayClassName="myoverlay"
                    >
                        <div style={{ fontSize: 'large' }}>Really reset?</div>
                        <Button onClick={() => this.toggleResetModal()}
                            style={{ margin: '25px 15px 5px 15px' }}>Cancel</Button>
                        <Button onClick={() => {
                            this.toggleResetModal()
                            this.getLeagueChamps()
                        }}
                            style={{ margin: '25px 15px 5px 15px' }}>Yes</Button>
                    </Modal>

                    <Modal
                        ariaHideApp={false}
                        isOpen={this.state.submitModalEnabled}
                        contentLabel="Submit modal"
                        className="mymodal"
                        overlayClassName="myoverlay"
                    >

                        <div style={{ fontSize: 'large' }}>Really submit?</div>
                        <input value={this.state.inputValue} onChange={evt => this.updateInputValue(evt)}
                            style={{ margin: '25px 15px 0px 15px' }}
                            placeholder='Your name' />
                        <div>
                            <Button onClick={() => this.toggleSubmitModal()}
                                style={{ margin: '25px 15px 5px 15px' }}>Cancel</Button>

                            <Button disabled={!this.state.inputValue} onClick={() => {
                                this.toggleSubmitModal()
                                this.submit()
                            }}
                                style={{ margin: '25px 15px 5px 15px' }}>Submit</Button>
                        </div>
                    </Modal>
                </div>
                <div
                    style={getDivStyle()}
                >

                    <DragDropContext onDragEnd={this.onDragEnd}>
                        <Droppable droppableId="droppable">
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    style={getListStyle(snapshot.isDraggingOver, 'red')}>
                                    {this.state.items.map((item, index) => (
                                        <Draggable
                                            key={item.id}
                                            draggableId={item.id}
                                            index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={getItemStyle(
                                                        snapshot.isDragging,
                                                        provided.draggableProps.style
                                                    )}>
                                                    {item.content}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                        <Droppable droppableId="droppable2">
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    style={getListStyle(snapshot.isDraggingOver, 'blue')}>
                                    {this.state.selected.map((item, index) => (
                                        <Draggable
                                            key={item.id}
                                            draggableId={item.id}
                                            index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={getItemStyle(
                                                        snapshot.isDragging,
                                                        provided.draggableProps.style
                                                    )}>
                                                    {item.content}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </div >
        );
    }
}

// Put the things into the DOM!
// ReactDOM.render(<LeagueList />, document.getElementById('leaguelist'));
