import * as React from 'react';

type IModalProps = {
    id: string;
    title: string;
    bodyHeight?: string;
    minBodyHeight?: string
};

class Modal extends React.Component<IModalProps, { }> {
    private getComponent(key: string) {
        if (this.props.children) {
            return (this.props.children as ({key: string})[]).filter((component) => {
                if (!component) return false;
                return component.key === key;
            });
        }
    };

    public render() {
        return <div id={ this.props.id } className="modal fade" tabIndex={ -1 } role="dialog">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 className="modal-title">{ this.props.title }</h4>
                    </div>
                    <div className="modal-body" style={{minHeight: this.props.minBodyHeight, height: this.props.bodyHeight}}>
                        { this.getComponent("body") }
                    </div>
                    <div className="modal-footer">
                        { this.getComponent("footer") }
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default Modal;
