import React, { Component } from 'react';
import PropTypes from "prop-types";

var d3 = require("d3")

const width = 500;
const height = 100;
const margin = {top: 10, right: 40, bottom: 10, left: 40};
const dy = 50;
const dx = 10;

const tree = d3.tree().nodeSize([dx, dy])
const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x)

// var data = require("./flare-2.json");
        
class D3JS2 extends Component {
    static propTypes = {
        codesHierarchyData: PropTypes.object,
      };
      
    constructor(props) {
        super(props)
        this.createD3JS2 = this.createD3JS2.bind(this)
    }

    componentDidMount() {
        this.createD3JS2();
    }

    componentDidUpdate() {
        this.createD3JS2();
    }

    createD3JS2() {

        const node = this.node;
        const svgElement = d3.select(node);
        var data = this.props.codesHierarchyData
        console.log('data type of data='+typeof(data))
        console.log('data='+data);
        const root = d3.hierarchy(data);

        root.x0 = dy / 2;
        root.y0 = 0;
        root.descendants().forEach((d, i) => {
          d.id = i;
          d._children = d.children;
          if (d.depth && d.data.name.length !== 7) d.children = null;
        });

        svgElement.attr("viewBox", [-margin.left, -margin.top, width, dx])
            .style("font", "10px sans-serif")
            .style("user-select", "none");

        const gLink = svgElement.append("g")
            .attr("fill", "none")
            .attr("stroke", "#555")
            .attr("stroke-opacity", 0.4)
            .attr("stroke-width", 1.5);

        const gNode = svgElement.append("g")
            .attr("cursor", "pointer")
            .attr("pointer-events", "all");


            function update(source) {
                const duration = d3.event && d3.event.altKey ? 2500 : 250;
                const nodes = root.descendants().reverse();
                const links = root.links();
            
                // Compute the new tree layout.
                tree(root);
            
                let left = root;
                let right = root;
                root.eachBefore(node => {
                  if (node.x < left.x) left = node;
                  if (node.x > right.x) right = node;
                });
            
                const height = right.x - left.x + margin.top + margin.bottom;
            
                const transition = svgElement.transition()
                    .duration(duration)
                    .attr("viewBox", [-margin.left, left.x - margin.top, width, height])
                    .tween("resize", window.ResizeObserver ? null : () => () => svgElement.dispatch("toggle"));
            
                // Update the nodes…
                const node = gNode.selectAll("g")
                  .data(nodes, d => d.id);
            
                // Enter any new nodes at the parent's previous position.
                const nodeEnter = node.enter().append("g")
                    .attr("transform", d => `translate(${source.y0},${source.x0})`)
                    .attr("fill-opacity", 0)
                    .attr("stroke-opacity", 0)
                    .on("click", d => {
                      d.children = d.children ? null : d._children;
                      update(d);
                    });
            
                nodeEnter.append("circle")
                    .attr("r", 2.5)
                    .attr("fill", d => d._children ? "#555" : "#999")
                    .attr("stroke-width", 10);
            
                nodeEnter.append("text")
                    .attr("dy", "0.31em")
                    .attr("x", d => d._children ? -6 : 6)
                    .attr("text-anchor", d => d._children ? "end" : "start")
                    .text(d => d.data.name + " " + d.data.value.toFixed(2))
                  .clone(true).lower()
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-width", 3)
                    .attr("stroke", "white");
            
                // Transition nodes to their new position.
                const nodeUpdate = node.merge(nodeEnter).transition(transition)
                    .attr("transform", d => `translate(${d.y},${d.x})`)
                    .attr("fill-opacity", 1)
                    .attr("stroke-opacity", 1);
            
                // Transition exiting nodes to the parent's new position.
                const nodeExit = node.exit().transition(transition).remove()
                    .attr("transform", d => `translate(${source.y},${source.x})`)
                    .attr("fill-opacity", 0)
                    .attr("stroke-opacity", 0);
            
                // Update the links…
                const link = gLink.selectAll("path")
                  .data(links, d => d.target.id);
            
                // Enter any new links at the parent's previous position.
                const linkEnter = link.enter().append("path")
                    .attr("d", d => {
                      const o = {x: source.x0, y: source.y0};
                      return diagonal({source: o, target: o});
                    });
            
                // Transition links to their new position.
                link.merge(linkEnter).transition(transition)
                    .attr("d", diagonal);
            
                // Transition exiting nodes to the parent's new position.
                link.exit().transition(transition).remove()
                    .attr("d", d => {
                      const o = {x: source.x, y: source.y};
                      return diagonal({source: o, target: o});
                    });
            
                // Stash the old positions for transition.
                root.eachBefore(d => {
                  d.x0 = d.x;
                  d.y0 = d.y;
                });
            }
        update(root)
    }

    render() {
        return (
            <div>
                <h1>Chapter Prediction</h1>
                <svg ref={node => this.node = node}>
                </svg>
            </div>
        );
    }
}

export default D3JS2;