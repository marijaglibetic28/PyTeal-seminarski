import beaker
import pyteal as pt


class CalculatorState:
    total = beaker.GlobalStateValue(
        stack_type=pt.TealType.uint64, descr="A calculator total value"
    )


app = beaker.Application("CalculatorApp", state=CalculatorState)


@app.external
def add(num: pt.abi.Uint64, *, output: pt.abi.Uint64) -> pt.Expr:
    """add value to the total"""
    return pt.Seq(
        app.state.total.set(app.state.total.get() + num.get()),
        output.set(app.state.total.get()),
    )


@app.external
def subtract(num: pt.abi.Uint64, *, output: pt.abi.Uint64) -> pt.Expr:
    """subtract value from the total"""
    return pt.Seq(
        pt.If(app.state.total.get() > num.get())
        .Then(app.state.total.set(app.state.total.get() - num.get()))
        .Else(app.state.total.set(pt.Int(0))),
        output.set(app.state.total.get()),
    )


@app.external
def hello(name: pt.abi.String, *, output: pt.abi.String) -> pt.Expr:
    return output.set(pt.Concat(pt.Bytes("Hello, "), name.get()))
