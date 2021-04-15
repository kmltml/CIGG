import { NetState } from "./net";
import { Bounds } from "./bounds";
export class Segment {
    constructor() {
        this.switches = [];
        this.points = [];
        this.net = undefined;
        this.bounds = new Bounds({ x: 0, y: 0 }, { x: -1, y: -1 });
    }
    isActive() {
        return this.switches.some(sw => sw.state && sw.shape !== "diamond");
    }
    draw(ctxt, state) {
        var _a;
        if ((_a = this.net) === null || _a === void 0 ? void 0 : _a.highlighted) {
            ctxt.lineWidth = 3;
        }
        else {
            ctxt.lineWidth = 1;
        }
        if (state.running) {
            this.drawRunning(ctxt);
        }
        else {
            this.drawDesign(ctxt);
        }
        ctxt.strokeStyle = "black";
        ctxt.lineWidth = 1;
    }
    drawRunning(ctxt) {
        const activePoints = this.points.filter(p => {
            if (p.state === undefined) {
                return true;
            }
            if (p.state) {
                if (p.shape !== "diamond") {
                    return true;
                }
                else {
                    return p.activeFor(this);
                }
            }
        });
        let color = "";
        switch (this.net.state) {
            case NetState.Floating:
                color = "#3870a8";
                break;
            case NetState.Low:
                color = "#808080";
                break;
            case NetState.High:
                color = "#000000";
                break;
            case NetState.Error:
                color = "#bd2600";
                break;
        }
        this.drawPoints(ctxt, activePoints, color);
    }
    drawDesign(ctxt) {
        const points = this.points.filter(sw => sw.state || sw.shape !== "diamond");
        const activePoints = points.filter(p => {
            if (p.state === undefined) {
                return true;
            }
            if (p.state) {
                if (p.shape !== "diamond") {
                    return true;
                }
                else {
                    return p.activeFor(this);
                }
            }
        });
        if (activePoints.length != 0) {
            this.drawPoints(ctxt, activePoints, "rgba(0, 0, 0, 1.0)");
            const inactiveBefore = points.slice(0, points.indexOf(activePoints[0]) + 1)
                .filter(sw => sw.state || sw.shape !== "diamond");
            this.drawPoints(ctxt, inactiveBefore, "rgba(0, 0, 0, 0.3)");
            const inactiveAfter = points.slice(points.indexOf(activePoints[activePoints.length - 1]))
                .filter(sw => sw.state || sw.shape !== "diamond");
            this.drawPoints(ctxt, inactiveAfter, "rgba(0, 0, 0, 0.3)");
        }
        else {
            this.drawPoints(ctxt, points.filter(sw => sw.state || sw.shape !== "diamond"), "rgba(0, 0, 0, 0.3)");
        }
    }
    drawPoints(ctxt, points, color) {
        if (points.length <= 1) {
            return;
        }
        ctxt.strokeStyle = color;
        ctxt.beginPath();
        ctxt.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctxt.lineTo(points[i].x, points[i].y);
        }
        ctxt.stroke();
    }
    addSwitch(sw) {
        if (this.switches.includes(sw)) {
            return;
        }
        this.switches.push(sw);
        this.points.push(sw);
        this.resortPoints();
        this.bounds = Bounds.fromPoints(this.points).addMargin(2);
        console.log(this.bounds);
    }
    resortPoints() {
        if (this.points.length <= 1) {
            return;
        }
        this.points.sort((a, b) => (a.x == b.x) ? a.y - b.y : a.x - b.x);
    }
}
