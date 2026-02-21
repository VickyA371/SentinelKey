import React from "react";
import {
    Control,
    Controller,
    FieldValues,
    Path,
} from "react-hook-form";

type ValidationControllerPropTypes<T extends FieldValues> = {
    control: Control<T, any, T>;
    name: Path<T>;
    changeHandlerKey?: string;
    valueKey?: string;
    children: React.ReactElement<any>;
};

function ValidationController<T extends FieldValues>({
    control,
    name,
    children,
    changeHandlerKey = 'onChangeText',
    valueKey='value'
}: ValidationControllerPropTypes<T>) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value }, fieldState: { error } }) =>
                React.cloneElement(children, {
                    [changeHandlerKey]: onChange,
                    [valueKey]: value,
                    error: error?.message
                })
            }
        />
    );
}

export default ValidationController;