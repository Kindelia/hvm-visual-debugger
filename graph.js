const objectMap = (obj, fn) => {
    var ret = []
    if (obj) {
	for (let [key, val] of Object.entries(obj)) {
	    var entry = fn(key, val);
	    if (!(typeof entry === "undefined"))
		ret = [...ret, fn(key, val)]
	}
    }
    return ret
}

const objectFilter = (obj, predicate) => {
    let ret = {};

    for (let [key, val] of Object.entries(obj)){
	if (predicate(key, val))
	    ret[key] = val;
    }
    return ret
}

function findNext(loc) {
    var sorted = Object.keys(memory).sort((a, b) => a - b)
    for (var i = 0; i < sorted.length; i++) {
	if (sorted[i] == loc) return sorted[i+1];
    }
}

function memory_entry_text (loc, lnk) {
    switch (lnk.tag) {
    case "NUM":
	return `[${loc}] NUM ${lnk.val}`
    case "ERA":
	return `[${loc}] ERASED`;
    default:
	return `[${loc}] ${lnk.tag} ${lnk.loc}`
    }
}

function add_to_memory_list(loc, lnk, cy) {
    var memory_list = document.getElementById('memory-list')
    var text = memory_entry_text(loc, lnk);
    var entry = document.createElement('li');
    var point_loc = () => {
	if (lnk.tag === "ARG")
	    return graph.positions[lnk.loc]
	else
	    return lnk.loc
    }
    entry.setAttribute("id", node_id(loc));
    entry.classList.add(lnk.tag);
    entry.appendChild(document.createTextNode(text))
    entry.onmouseenter = () => (cy.$id(node_id(point_loc())).addClass("MOUSE_HOVER"))
    entry.onmouseleave = () => (cy.$id(node_id(point_loc())).removeClass("MOUSE_HOVER"))

    let next_loc = findNext(loc);
    if (next_loc) {
	var next = document.getElementById(node_id(next_loc))
	memory_list.insertBefore(entry, next);
    }
    else 
	memory_list.appendChild(entry);
}

function delete_from_memory_list(loc) {
    var elem = document.getElementById(node_id(loc))
    if (elem)
	elem.remove();
}


function getOpeName(val){
    switch (val) {
    case ADD: return "+";
    case SUB: return "-";
    case MUL: return "*";
    case DIV: return "/";
    case MOD: return "%";
    case AND: return "&";
    case OR : return "|";
    case XOR: return "^";
    case SHL: return "<<";
    case SHR: return ">>";
    case LTN: return "<";
    case LTE: return "<=";
    case EQL: return "==";
    case GTE: return ">=";
    case GTN: return ">";
    case NEQ: return "!="; 
    default: return "??";
    }
}


function is_node(lnk) {
    if ((lnk.tag === "CTR" || lnk.tag === "FUN") && (lnk.ari === 0)) {
	return false
    }
    else if (lnk.tag === "VAR" || lnk.tag === "NUM" || lnk.tag === "ARG") {
	return false
    }
    else {
	return true
    }
}

function is_inline(lnk) {
    if ((lnk.tag === "CTR" || lnk.tag === "FUN") && (lnk.ari === 0)) {
	return true
    }
    else if (lnk.tag === "VAR" || lnk.tag === "NUM" || lnk.tag === "ARG" || lnk.tag == "DP0" || lnk.tag === "DP1") {
	return true
    }
    else {
	return false
    }
}


var node_id = (loc) => `N${loc}`;
var memory = {}; // memory_location : link
var graph = {nodes: {},
	     edges: {}, // APP 8 -> 8, 9; [9]
	     positions: {} // 9 -> 8,positions? idk what name to give here
	    };

function link(loc, lnk, cy) {
    memory[loc] = lnk;
    if (lnk.tag === "VAR" || lnk.tag === "DP0" || lnk. tag === "DP1") {
	var var_loc = lnk.loc + (lnk.tag === "DP1" ? BigInt(1) : BigInt(0));
	var arg_lnk = {tag: "ARG", loc: loc};
	memory[var_loc] = arg_lnk;
	graph.edges[var_loc] = loc;

	delete_from_memory_list(var_loc);
	add_to_memory_list(var_loc, arg_lnk, cy);
    }
    add_lnk_to_graph(loc, lnk, cy);
    delete_from_memory_list(loc);
    add_to_memory_list(loc, lnk, cy);
}

function add_lnk_to_graph(loc, lnk, cy) {
    if (is_node(lnk))
	graph.nodes[lnk.loc] = lnk;
    if (!((lnk.tag === "CTR" && lnk.ari === 0) || (lnk.tag == "ERA"))) 
	graph.edges[loc] = lnk.loc;
    switch (lnk.tag) {
    case "LAM":
    case "SUP":
    case "APP":
    case "OP2":
	graph.positions[lnk.loc + 0n] = lnk.loc;
	graph.positions[lnk.loc + 1n] = lnk.loc;
	break;
    case "DP0":
    case "DP1":
	graph.positions[lnk.loc + 0n] = lnk.loc;
	graph.positions[lnk.loc + 1n] = lnk.loc;
	graph.positions[lnk.loc + 2n] = lnk.loc;
	break;
    case "FUN":
    case "CTR":
	var ari = ARITY[lnk.fid];
	if (ari > 0) {
	    for (var i = 0; i < lnk.ari; i++) {
		graph.positions[lnk.loc + BigInt(i)] = lnk.loc;
	    }
	}
	break;
    case "ROOT":
	graph.positions[lnk.loc] = lnk.loc;
	break
    }

    if (is_node(lnk))
	draw_node(loc, lnk, cy);
}

function draw_node(loc, lnk, cy) {
    cy.remove(cy.$id(node_id(lnk.loc)));
    cy.add({group: "nodes",
	    data: {"id": node_id(lnk.loc),
		   "lnk": lnk,
		  }})
    
    // edge to father
    let father = graph.positions[loc];
    if (typeof father !== "undefined") {
	if (cy.$id(node_id(father)))
	    cy.add({group: "edges", data: {"source": node_id(father), "target": node_id(lnk.loc)}})
    }
    
    // edges to children
    let children = objectFilter(graph.edges, (source,_) => graph.positions[source] === lnk.loc)
    for (let [source, target] of Object.entries(children)) {
	if (cy.$id(node_id(graph.positions[target])).length > 0) {
	    cy.add({group: "edges", data: {"source": node_id(graph.positions[source]), "target": node_id(graph.positions[target])}})
	}
    }
    
    var layout = cy.layout({
	name : 'fcose',
	animate: 'end',
	nodeDimensionsIncludeLabels: true,
	fit: false,
	tile: true,
    })
    layout.run()
    
}

function invert_object(obj) {
    var ret = {}
    for (let [key, val] of Object.entries(obj)) {
	let existing = ret[val] || [];
	ret[val] = [...existing, key];
    }
    return ret;
}

function garbage_collect(cy) {
    var inverted_nodes = invert_object(graph.positions);
    for (let [node, children] of Object.entries(inverted_nodes)){
	if (children.every((i) => (typeof memory[i] === 'undefined'))) {
	    console.log("deleting node ", node);
	    cy.remove(cy.$id(node_id(node)))
	}
    }
	
}

var thread_moves = {};

function process_event(event, cy) {
    switch (event.tag) {
    case "LINK":
	link(event.loc, event.ptr, cy);
	break;
    case "FREE":
	cy.remove(`edge[source='${node_id(event.loc)}']`);
	
	graph.edges = objectFilter(graph.edges, (loc, _) => (graph.positions[loc] !== event.loc));
	var changed = cy.$id(node_id(event.loc))
	if (changed.degree() === 0 && changed.data("lnk").tag !== "ROOT")
	    cy.remove(changed);
	delete memory[event.loc];
	graph.positions = objectFilter(graph.positions, (loc, lnk_loc) => lnk_loc !== event.loc)
	delete_from_memory_list(event.loc);
	// garbage_collect(cy);
	// there should be some kind of garbage collection here
	// but i couldnt figure out exactly how.
	break;
    case "MOVE":
	var last_move = thread_moves[event.tid];
	if (typeof last_move !== 'undefined')
	    cy.$id(node_id(last_move)).removeClass("MOVE")
	cy.$id(node_id(event.loc)).addClass("MOVE");
	cy.$id(node_id(event.loc)).data({"tid": event.tid});
	thread_moves[event.tid] = event.loc;
	break;
    case "LOCK":
	cy.$id(node_id(event.loc)).addClass("LOCK");
	break;
    case "OPEN":
	cy.$id(node_id(event.loc)).removeClass("LOCK");
	break;
    default:
	console.log(event);
    }
    // draw_memory_list();
    // draw_event_list(); // TODO: this
}
