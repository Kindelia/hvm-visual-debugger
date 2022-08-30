const LOG_MOVE = "0x0";
const LOG_LINK = "0x1";
const LOG_FREE = "0x2";
const LOG_LOCK = "0x3";
const LOG_OPEN = "0x4";
const VAL = BigInt("0x1");
const EXT = BigInt("0x100000000");
const ARI = BigInt("0x100000000000000");
const TAG = BigInt("0x1000000000000000");
const NUM_MASK = BigInt("0xFFFFFFFFFFFFFFF");
const DP0 = BigInt(0x0) // points to the dup node that binds this variable (left side);
const DP1 = BigInt(0x1) // points to the dup node that binds this variable (right side);
const VAR = BigInt(0x2) // points to the λ that binds this variable;
const ARG = BigInt(0x3) // points to the occurrence of a bound variable a linear argument;
const ERA = BigInt(0x4) // signals that a binder doesn't use its bound variable;
const LAM = BigInt(0x5) // arity = 2;
const APP = BigInt(0x6) // arity = 2;
const PAR = BigInt(0x7) // arity = 2 // TODO: rename to SUP;
const CTR = BigInt(0x8) // arity = user defined;
const CAL = BigInt(0x9) // arity = user defined;
const OP2 = BigInt(0xA) // arity = 2;
const NUM = BigInt(0xB) // arity = 0 (unboxed);
const FLO = BigInt(0xC) // arity = 0 (unboxed);
const NIL = BigInt(0xF) // not used;
const ADD = BigInt(0x0);
const SUB = BigInt(0x1);
const MUL = BigInt(0x2);
const DIV = BigInt(0x3);
const MOD = BigInt(0x4);
const AND = BigInt(0x5);
const OR =  BigInt(0x6);
const XOR = BigInt(0x7);
const SHL = BigInt(0x8);
const SHR = BigInt(0x9);
const LTN = BigInt(0xA);
const LTE = BigInt(0xB);
const EQL = BigInt(0xC);
const GTE = BigInt(0xD);
const GTN = BigInt(0xE);
const NEQ = BigInt(0xF);

function get_tag(lnk) {
  return lnk / TAG;
}

function get_ext(lnk) {
  return (lnk / EXT) & BigInt("0xFFFFFF");
}

function get_val(lnk) {
  return lnk & BigInt("0xFFFFFFFF");
}

function get_num(lnk) {
  return lnk & BigInt("0xFFFFFFFFFFFFFFF");
}

function get_loc(lnk, arg) {
  return get_val(lnk) + arg;
}

function make_log(obj) {
    switch (obj[1]) {
    case LOG_MOVE:
	return {
            tag: "MOVE",
            idx: BigInt(obj[0]),
            tid: BigInt(obj[2]),
            loc: BigInt(obj[3]),
	};
    case LOG_LINK:
	return {
            tag: "LINK",
            idx: BigInt(obj[0]),
            tid: BigInt(obj[2]),
            loc: BigInt(obj[3]),
            ptr: make_ptr(BigInt(obj[4])),
	};
    case LOG_LOCK:
	return {
            tag: "LOCK",
            idx: BigInt(obj[0]),
            tid: BigInt(obj[2]),
            loc: BigInt(obj[3]),
	};
    case LOG_OPEN:
	return {
            tag: "OPEN",
            idx: BigInt(obj[0]),
            tid: BigInt(obj[2]),
            loc: BigInt(obj[3]),
	};
    case LOG_FREE:
	return {
 	    tag: "FREE",
	    idx: BigInt(obj[0]),
	    tid: BigInt(obj[2]),
	    loc: BigInt(obj[3]),
	}
    }
}

function make_ptr(ptr) {
    switch (get_tag(ptr)) {
    case VAR: return {
	tag: "VAR",
	loc: get_val(ptr),
    };
    case DP0: return {
	tag: "DP0",
	col: get_ext(ptr),
	loc: get_val(ptr),
    };
    case DP1: return {
	tag: "DP1",
	col: get_ext(ptr),
	loc: get_val(ptr),
    };
    case ARG: return {
	tag: "ARG",
	loc: get_val(ptr),
    };
    case ERA: return {
	tag: "ERA",
    };
    case LAM: return {
	tag: "LAM",
	loc: get_val(ptr),
    };
    case APP: return {
	tag: "APP",
	loc: get_val(ptr),
    };
    case PAR: return {
	tag: "SUP",
	col: get_ext(ptr),
	loc: get_val(ptr),
    };
    case OP2: return {
	tag: "OP2",
	ope: get_ext(ptr),
	loc: get_val(ptr),
    };
    case NUM: return {
	tag: "NUM",
	val: get_val(ptr),
    };
    case CTR:
	return {
	tag: "CTR",
	fid: get_ext(ptr),
	nam: NAME[get_ext(ptr)] || "?",
	ari: ARITY[get_ext(ptr)] || 0,
	loc: get_val(ptr),
    };
    case CAL: return {
	tag: "FUN",
	fid: get_ext(ptr),
	nam: NAME[get_ext(ptr)] || "?",
	ari: ARITY[get_ext(ptr)] || 0,
	loc: get_val(ptr),
    };
    default:
	console.error(ptr);
	return {
	    tag: "???",
	};
    }
}


function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}


function nodeColor(elem) {
    var lnk = elem.data("lnk")
    switch (lnk.tag) {
    case "LAM":	return 'BlanchedAlmond';
    case "SUP": return 'Coral';
    case "APP": return 'DarkSeaGreen';
    case "DP0":
    case "DP1": return 'IndianRed';
    case "OP2": return 'SandyBrown'
    case "CTR":
    case "FUN": return 'lightgreen'; // TODO: color generator based on ctr/fun id;
    default: return "gray";
    }
}

// function that gets the text written inside node
function inlineText(loc) {
    var arg = memory[loc];
    if (arg === undefined) {
	return "?"
    }
    else if (arg.tag === "NUM") {
	return arg.val;
    }
    else if (arg.tag === "CTR" || arg.tag === "FUN") {
	if (arg.ari === 0) {
	    return arg.nam;
	}
	else return "_"
    }
    else if (arg.tag === "VAR") {
	return `x${arg.loc}`;
    }
    else if (arg.tag === "ARG") {
	return `x${arg.loc}`;
    }
    else if (arg.tag === "DP0") {
	return `a${arg.loc}`;
    }
    else if (arg.tag === "DP1") {
	return `b${arg.loc}`;
    }
    else 
	return "_";
}

// function that returns the main
// text to be displayed in a node.
function nodeText(elem) {
    var lnk = elem.data("lnk");
    switch (lnk.tag) {
    case "LAM":
	return `λ x${lnk.loc} ${inlineText(lnk.loc + 1n)}`
    case "SUP":
	return `{${inlineText(lnk.loc)} ${inlineText(lnk.loc + 1n)}}`
    case "APP":
	return `@ ${inlineText(lnk.loc)} ${inlineText(lnk.loc + 1n)}`
    case "DP0":
    case "DP1":
	return `dup a${lnk.loc} b${lnk.loc} = ${inlineText(lnk.loc + 2n)}`;
    case "OP2":
	return `${getOpeName(lnk.ope)} ${inlineText(lnk.loc)} ${inlineText(lnk.loc + 1n)}`;
    case "CTR":
    case "FUN":
	var name = lnk.nam;
	var text = name;
	for (var i=0; i < lnk.ari; i++) {
	    text += " " + inlineText(lnk.loc + BigInt(i));
	}
	return text;
    case "NUM":
	return "NUM ${lnk.val}"
    case "ROOT":
	return "ROOT " + inlineText(0);
    case "ERA":
	return "ERASED";
    default:
	return "???"
    }
}

function nodeWidth(elem) {
    var text = nodeText(elem);
    return text.length * 10 // 10?
}

// function that colors based on thread id
// but this is kinda dumb
function borderColor(elem) {
    var tid = elem.data("tid");
    switch (tid) {
    case 0n : return "green";
    case 1n : return "blue";
    case 2n : return "gray";
    case 3n : return "orange";
    case 4n : return "magenta";
    case 5n : return "lime";
    case 6n : return "purple";
    case 7n : return "yellow";
    default: return false;
    }
}

function add_to_event_list(log) {
    var event_list = document.getElementById('event-list');
    var text = (log.tag === "LINK") ? `T${log.tid} - ${log.tag} ${log.loc} ${log.ptr.tag}` : `T${log.tid} - ${log.tag} ${log.loc}`;
    var entry = document.createElement('li');
    entry.setAttribute("id", `L${log.idx}`);
    entry.appendChild(document.createTextNode(text))
    event_list.insertBefore(entry, event_list.firstChild);
}

window.onload = () => {
  var cy = cytoscape({
      container: document.getElementById('cy'), // container to render in
      classes: ["VAR", "DP0", "DP1", "ARG", "ERA", "LAM", "APP", "SUP", "OP2", "NUM", "CTR", "FUN" ], // will remove them later
      style: cytoscape.stylesheet()
	  .selector("edge").css({
	      'target-arrow-shape': 'triangle',
	      'curve-style': 'bezier',
	  })
	  .selector("node").css({
	      'shape': 'round-rectangle',
	      'height': 50, // 50?
              'width': nodeWidth,
	      'text-halign': 'center',
              'text-valign': 'center',
	      'padding': 2, // 2?
	      'content': nodeText,
	      'background-color': nodeColor,
	  })
	  .selector(".MOVE").css({
	      'border-width': 4,
	      'border-style': "solid",
	      'border-color': borderColor
	  })
	  .selector(".LOCK").css({
	      'border-width': 5,
	      'border-style': 'double',
	      'border-color': 'red'
	  })
	  .selector(".MOUSE_HOVER").css({
	      'background-color': 'red'
	  })
  });
    
    event_index = 0;
    const root = {tag: "ROOT", loc: 0, ari: 1, nam: 'ROOT', fid: -1}
    link(-1, root, cy);
    
    var button = document.getElementById("nextEvent");
    button.onclick = () => {
	if (event_index < LOG.length) {
	    let log = make_log(LOG[event_index]);
	    process_event(log, cy);
	    add_to_event_list(log);
	}
	else
	    button.disabled = true;
	event_index++;
    }
};
