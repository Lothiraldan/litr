// Copyright 2018-2021 by Boris Feld

import "react-bulma-components/dist/react-bulma-components.min.css";

import { observer } from "mobx-react";
import Mousetrap from "mousetrap";
import React, { Component } from "react";
import { Card, Columns } from "react-bulma-components";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeTree as Tree } from "react-vtree";

import { editTest } from "../api";
import { TreeLine } from "../components/TreeLine";
import { treenodeViewerComponent } from "../containers/TestDetails.js";
import store, {
  deselect_selected_by_parent,
  select_failed,
  select_passed,
  select_skipped,
  treeWalker,
} from "../store";
import Runs from "./RunsList.js";

@observer
class Node extends React.Component {
  onClick = (full_node_id) => {
    store.select_node(full_node_id);
  };

  onCheck = (full_node_id) => {
    const node = store.suites.get_children_by_full_id(full_node_id);
    if (node.selected === "false") {
      node.select();
    } else if (node.selected === "true") {
      node.deselect();
    } else if (node.selected === "parent") {
      deselect_selected_by_parent(store.suites, full_node_id);
    }
    // this.props.treeData.ref.current.recomputeTree({ refreshNodes: true });
  };

  render() {
    const { isLeaf, nestingLevel, id } = this.props.data;

    const tree_node = store.suites.get_children_by_full_id(id);
    const selected = tree_node.selected;

    return (
      <div
        style={{
          ...this.props.style,
          paddingLeft: nestingLevel * 30,
          userSelect: null,
          cursor: "pointer",
        }}
      >
        <TreeLine
          id={id}
          status_summary={tree_node.status_summary}
          node_type={tree_node.type}
          name={tree_node.name}
          handleChange={this.props.toggle}
          isExpanded={this.props.isOpen}
          onClick={this.onClick}
          onChecked={this.onCheck}
          isChecked={selected}
          selected={id === store.selected_node}
          status={tree_node.status}
        />
      </div>
    );
  }
}


@observer
class Main extends Component {
  onCheck = (checked) => {
    this.props.state.setState({ checked });
  };

  onClick = (node) => {
    this.props.state.setState({ selected: node });
  };

  componentWillMount() {
    this.treeRef = React.createRef();
  }

  componentDidMount() {
    Mousetrap.bind(["f"], select_failed);
    Mousetrap.bind(["s"], select_skipped);
    Mousetrap.bind(["p"], select_passed);
  }

  componentWillUnmount() {
    Mousetrap.unbind(["f"]);
    Mousetrap.unbind(["s"]);
    Mousetrap.unbind(["p"]);
  }

  render() {
    let nodeViewerComponent = treenodeViewerComponent(
      store.selected_node,
      editTest
    );

    if (this.treeRef && this.treeRef.current) {
      this.treeRef.current.recomputeTree({ refreshNodes: true });
    }

    let tree_rerender_key = store.suites.childrens_by_id.keys();
    let tree_rerendre_key_2 = store.query_text;

    return (
      <div className="row">
        <Columns.Column size={5}>
          <Card>
            <Card.Header>
              <Card.Header.Title>Tests list</Card.Header.Title>
            </Card.Header>
            <Card.Content>
              <div
                style={{
                  flex: "1 1 auto",
                  flexDirection: "column",
                  height: 600,
                }}
              >
                <AutoSizer>
                  {({ width }) => (
                    <Tree
                      treeWalker={treeWalker}
                      ref={this.treeRef}
                      itemSize={24}
                      height={600}
                      width={width}
                    >
                      {Node}
                    </Tree>
                  )}
                </AutoSizer>
              </div>
            </Card.Content>
          </Card>
        </Columns.Column>

        <Columns.Column size={5}>{nodeViewerComponent}</Columns.Column>

        <Columns.Column size={2}>
          <Runs allRuns={store.runs} />
        </Columns.Column>
      </div>
    );
  }
}

export default Main;
