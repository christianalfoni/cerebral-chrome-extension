var DOM = React.DOM;

var ToolbarStyle = {
  backgroundColor: '#EEE',
  padding: '5px',
  borderBottom: '1px solid #999'
};

var ResetButton = {
  textDecoration: 'underline',
  cursor: 'pointer',
  marginRight: 10
};

var ToolbarNav = {
  listStyleType: 'none',
  padding: 0,
  margin: 0
};

var ToolbarItem = {
  display: 'inline-block',
  margin: '0 5px'
}

var ToolbarRightItem = {
  display: 'inline-block',
  margin: '0 5px',
  float: 'right'
};

var CollapseButton = {
  cursor: 'pointer',
  borderLeft: '1px solid #999',
  paddingLeft: '10px'
};

var ToolbarComponent = React.createClass({
  getInitialState: function () {
    return {
      stepValue: this.props.currentSignalIndex + 1 || 0,
      currentComputed: 0
    };
  },
  componentWillReceiveProps: function (nextProps) {
    this.setState({
      stepValue: nextProps.currentSignalIndex + 1
    });
  },
  toggleKeepState: function () {
    chrome.extension.sendMessage({
      action: 'code',
      content: 'var event = new Event("cerebral.dev.toggleKeepState");window.dispatchEvent(event);',
      tabId: chrome.devtools.inspectedWindow.tabId
    });
  },
  optimisticRangeUpdate: function (index) {
    this.setState({
      stepValue: index
    });
  },
  resetStore: function () {
    chrome.extension.sendMessage({
      action: 'code',
      content: 'var event = new Event("cerebral.dev.resetStore");window.dispatchEvent(event);',
      tabId: chrome.devtools.inspectedWindow.tabId
    });
  },
  logModel: function () {
    chrome.extension.sendMessage({
      action: 'code',
      content: 'var event = new Event("cerebral.dev.logModel");window.dispatchEvent(event);',
      tabId: chrome.devtools.inspectedWindow.tabId
    });
  },
  logComputedPath: function (event) {
    chrome.extension.sendMessage({
      action: 'code',
      content: 'var event = new CustomEvent("cerebral.dev.logComputedPath", {detail: ' + JSON.stringify(this.props.computedPaths[event.target.value - 1]) + '});window.dispatchEvent(event);',
      tabId: chrome.devtools.inspectedWindow.tabId
    });
    this.forceUpdate();
  },
  remember: function (change) {
    var index = this.state.stepValue + change;
    chrome.extension.sendMessage({
      action: 'code',
      content: 'var event = new CustomEvent("cerebral.dev.remember", {detail: ' + (index - 1) + '});window.dispatchEvent(event);',
      tabId: chrome.devtools.inspectedWindow.tabId
    });
    this.optimisticRangeUpdate(index);
  },
  renderComputed(path, index) {
    return DOM.option({
      value: index
    },
      path
    )
  },
  render: function() {

    return DOM.div(null,
      DOM.div({
          style: ToolbarStyle
        },
        DOM.ul({
            style: ToolbarNav
          },
          DOM.li({
              style: ToolbarItem
            },
            DOM.button({
              disabled: this.props.isExecutingAsync || this.props.steps < 2 || this.state.stepValue === 0,
              onClick: this.remember.bind(null, -1)
            }, '❰'),
            ' ',
            this.state.stepValue,
            ' / ',
            this.props.totalSignals,
            ' ',
            DOM.button({
              disabled: this.props.isExecutingAsync || this.props.steps < 2 || this.state.stepValue === this.props.steps,
              onClick: this.remember.bind(null, 1)
            }, '❱')
          ),
          DOM.li({
              style: ToolbarItem
            }, !this.props.isRemembering &&
            (this.props.hasExecutingAsyncSignals /*|| this.props.recorder.isPlaying || this.props.recorder.isRecording*/) ?
            null :
            DOM.span({
              style: ResetButton,
              onClick: this.resetStore,
            }, 'reset'),
            DOM.span({
              style: ResetButton,
              onClick: this.logModel
            }, 'model')
          ),
          this.props.computedPaths.length ? DOM.li({
            style: ToolbarItem
          },
            DOM.select({
              onChange: this.logComputedPath,
              value: this.state.currentComputed
            },
              ['Run a computed state...'].concat(this.props.computedPaths).map(this.renderComputed)
            )
          ) : null,
          DOM.li({
              style: ToolbarRightItem
            },
            DOM.label(null, DOM.input({
              type: 'checkbox',
              style: {
                margin: '3px'
              },
              onChange: this.toggleKeepState,
              checked: !this.props.willKeepState
            }), ' reset on refresh')
          )
        )
      )
    );
  }
});
