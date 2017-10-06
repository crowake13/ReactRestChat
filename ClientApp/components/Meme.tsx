import * as React from 'react';
import ConversationList from './ConversationList';

export type IMemeProps = { 
    imageSrc: string;
    topText: string;
    bottomText: string;
 };

class Meme extends React.Component<IMemeProps, { }> {
    public render() {
        return <div className="meme" style={{backgroundImage: "url(" + this.props.imageSrc + ")", backgroundPosition: "center", backgroundRepeat: "no-repeat"}}>
            <p className="top">{ this.props.topText }</p>
            <p className="bottom">{ this.props.bottomText }</p>
        </div>;
    }
}

export default Meme;
