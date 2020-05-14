import * as React from "react";
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { ListViewComponent } from '@syncfusion/ej2-react-lists';
import './calendarview.scss';

export class AclView extends React.Component {
    constructor(props) {
        super(props);
        this.listviewInstance = null;
        // define the array of Json
        this.dataSource = [
            { text: "Hennessey Venom", id: "1", icon: "delete-icon" },
            { text: "Bugatti Chiron", id: "2", icon: "delete-icon" },
            { text: "Bugatti Veyron Super Sport", id: "3", icon: "delete-icon" },
            { text: "Aston Martin One- 77", id: "4", icon: "delete-icon" },
            { text: "Jaguar XJ220", id: "list-5", icon: "delete-icon" },
            { text: "McLaren P1", id: "6", icon: "delete-icon" }
        ];
        this.fields = { text: "text", iconCss: "icon" };      

    }

    listTemplate(data) {
        return (<div className="text-content">
            {data.text}
            <span className="delete-icon" onClick={this.deleteItem.bind(this)} />
        </div>);
    }
    addItem() {
        let data = {
            text: "Koenigsegg - " + (Math.random() * 1000).toFixed(0),
            id: (Math.random() * 1000).toFixed(0).toString(),
            icon: "delete-icon"
        };
        this.listviewInstance.addItem([data]);
    }
    deleteItem(args) {
        args.stopPropagation();
        let liItem = args.target.parentElement.parentElement;
        this.listviewInstance.removeItem(liItem);
    }

   render() {
        return (<div>
        <ListViewComponent id="sample-list" dataSource={this.dataSource} fields={this.fields} template={this.listTemplate.bind(this)} ref={listview => {
            this.listviewInstance = listview;
        }}/>
        <ButtonComponent id="btn" onClick={this.addItem.bind(this)}>
          Add Item
        </ButtonComponent>
      </div>);
    }
}

export default AclView;



