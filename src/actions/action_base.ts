import Schema from "../model/schema";
import ActionHistory from "./history";


abstract class ActionBase {

    apply(history: ActionHistory) {
        
    }

    unapply(history: ActionHistory) {

    }

}

export default ActionBase