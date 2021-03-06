// @flow

import React from 'react'
import {pure} from 'recompose';
import {withStyles} from 'material-ui/styles';
import Toolbar from 'material-ui/Toolbar';

import Title from './Title';
import TimelineMenu from './TimelineMenu';
import ProgressBar from './ProgressBar';

const styles = theme => ({

});

type Props = {
    classes: Object,
    timelineIndex: number,
    timeline: Object,
    ownerInfo: Object,
    isStreaming: boolean,
    latestContentId: ?string,
    menuOpen: boolean,
    anchorEl: Object,
    setTimelineMenu: Function,
    callApi: Function,
    deleteTimeline: Function,
};

const InfoBar = pure((props: Props) => (
    <div>
        <Toolbar>
            <div style={{marginRight: 'auto'}}>
                <Title
                    timelineName={props.timeline.timelineType}
                    ownerInfo={props.ownerInfo} />
            </div>
            <div style={{marginLeft: 'auto'}}>
                <TimelineMenu
                    services={props.ownerInfo.service}
                    timelineIndex={props.timelineIndex}
                    timeline={props.timeline}
                    isStreaming={props.isStreaming}
                    latestContentId={props.latestContentId}
                    open={props.menuOpen}
                    anchorEl={props.anchorEl}
                    setTimelineMenu={props.setTimelineMenu}
                    callApi={props.callApi}
                    deleteTimeline={props.deleteTimeline} />
            </div>
        </Toolbar>
        <ProgressBar inProgressCount={props.timeline.inProgressCount} inStreaming={props.isStreaming} />
    </div>
));

export default withStyles(styles)(InfoBar);
