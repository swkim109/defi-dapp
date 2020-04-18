import {EventActions} from "@drizzle/store";

const EventNotifier = store => next => action => {
    
    if (action.type === EventActions.EVENT_FIRED) {
        
        //console.log(action);
        const contract = action.name;
        const eventName = action.event.event;
        const returnValues = action.event.returnValues;
        const display = `${contract}(${eventName})`
        console.log(display, returnValues);
    }
    return next(action);
}

export default EventNotifier;
