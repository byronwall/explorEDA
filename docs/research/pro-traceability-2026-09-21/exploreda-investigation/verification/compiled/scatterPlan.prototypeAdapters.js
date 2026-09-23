"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawScatterProbe = drawScatterProbe;
exports.scatterProbeSvg = scatterProbeSvg;
function drawScatterProbe(plan, sink) {
    sink.begin(plan.width, plan.height, plan.clip);
    for (const mark of plan.marks)
        sink.point(mark.id, mark.x, mark.y, mark.radius, mark.fill, mark.opacity);
    sink.end();
}
const escape = (value) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character] ?? character);
/** Generates a real SVG document from the plan; safe text/attribute escaping. */
function scatterProbeSvg(plan) {
    const fragments = [];
    const clipId = `clip-${encodeURIComponent(plan.chartId).replace(/%/g, "_")}`;
    drawScatterProbe(plan, {
        begin(width, height, clip) {
            fragments.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Experimental scatter plan">`);
            fragments.push(`<defs><clipPath id="${escape(clipId)}"><rect x="${clip.x}" y="${clip.y}" width="${clip.width}" height="${clip.height}"/></clipPath></defs><g clip-path="url(#${escape(clipId)})">`);
        },
        point(id, x, y, radius, fill, opacity) {
            fragments.push(`<circle data-mark-id="${escape(id)}" cx="${x}" cy="${y}" r="${radius}" fill="${escape(fill)}" opacity="${opacity}"/>`);
        },
        end() { fragments.push("</g></svg>"); },
    });
    return fragments.join("");
}
