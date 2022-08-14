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
        tag: "move",
        idx: BigInt(obj[0]),
        tid: BigInt(obj[2]),
        loc: BigInt(obj[3]),
      };
    case LOG_LINK:
      return {
        tag: "link",
        idx: BigInt(obj[0]),
        tid: BigInt(obj[2]),
        loc: BigInt(obj[3]),
        ptr: make_ptr(BigInt(obj[4])),
      };
    case LOG_LOCK:
      return {
        tag: "lock",
        idx: BigInt(obj[0]),
        tid: BigInt(obj[2]),
        loc: BigInt(obj[3]),
      };
    case LOG_OPEN:
      return {
        tag: "open",
        idx: BigInt(obj[0]),
        tid: BigInt(obj[2]),
        loc: BigInt(obj[3]),
      };
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
    case CTR: return {
      tag: "CTR",
      fid: get_ext(ptr),
      nam: NAME[get_ext(ptr)] | "?",
      ari: ARITY[get_ext(ptr)] | 0,
      loc: get_val(ptr),
    };
    case CAL: return {
      tag: "FUN",
      fid: get_ext(ptr),
      nam: NAME[get_ext(ptr)] | "?",
      ari: ARITY[get_ext(ptr)] | 0,
      loc: get_val(ptr),
    };
    default: return {
      tag: "???",
    };
  }
}

window.onload = () => {

  var cvs = document.getElementById("cvs");
  var ctx = cvs.getContext("2d");

  function circle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, 50, 0, 2 * Math.PI);
    ctx.stroke();
  }

  circle(ctx, 50, 50, 10);

  for (var i = 0; i < LOG.length; ++i) {
    console.log(make_log(LOG[i]));
  }

};
