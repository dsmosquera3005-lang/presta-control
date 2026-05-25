import { d as createLucideIcon } from "./button-Ch56ZDAM.js";
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const CircleCheck = createLucideIcon("circle-check", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",
      key: "9njp5v"
    }
  ]
];
const Phone = createLucideIcon("phone", __iconNode);
function daysLate(paymentDateIso, to = /* @__PURE__ */ new Date()) {
  const a = /* @__PURE__ */ new Date(paymentDateIso + "T00:00:00");
  const ms = to.getTime() - a.getTime();
  return Math.floor(ms / 864e5);
}
function moraPercent(days) {
  if (days >= 15) return 20;
  if (days >= 5) return 10;
  return 0;
}
function calcMora(loan, to = /* @__PURE__ */ new Date()) {
  const days = Math.max(0, daysLate(loan.payment_date, to));
  const waived = !!loan.mora_waived;
  if (waived || loan.status === "pagado") {
    return { days, percent: 0, fee: 0, waived };
  }
  const percent = moraPercent(days);
  const fee = +(Number(loan.amount) * (percent / 100)).toFixed(2);
  return { days, percent, fee, waived };
}
function totalDue(expected, fee) {
  return +(Number(expected) + Number(fee)).toFixed(2);
}
export {
  CircleCheck as C,
  Phone as P,
  calcMora as c,
  totalDue as t
};
