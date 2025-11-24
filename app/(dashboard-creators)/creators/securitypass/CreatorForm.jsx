// Full Formik-powered Creator Form (all useState removed)
import { useFormik } from "formik";
import * as Yup from "yup";
import AsyncSelect from "react-select/async";
import debounce from "lodash.debounce";
import Input from "@/components/Input";
import FileUploadPlaceholder from "@/components/FileUploadPlaceholder";


export default function CreatorForm() {
    const validationSchema = Yup.object({
        name: Yup.string().required("Requerido"),
        stageName: Yup.string().required("Requerido"),
        email: Yup.string().email().required("Requerido"),
        phone: Yup.string().required("Requerido"),
        location: Yup.string().required("Requerido"),
        roles: Yup.object({
            mixing: Yup.boolean(),
            mastering: Yup.boolean(),
            recording: Yup.boolean(),
        }),
        exampleMix: Yup.mixed().nullable(),
        exampleMaster: Yup.mixed().nullable(),
        vocalExample: Yup.mixed().nullable(),
    });

    const formik = useFormik({
        initialValues: {
            name: "",
            stageName: "",
            email: "",
            phone: "",
            location: "",
            roles: { mixing: false, mastering: false, recording: false },
            exampleMix: null,
            exampleMaster: null,
            vocalExample: null,
        },
        validationSchema,
        onSubmit: (values) => {
            console.log("SUBMIT", values);
        },
    });

    const loadRoles = debounce(async (input, callback) => {
        callback(
            [
                { value: "mixing", label: "Mezcla" },
                { value: "mastering", label: "Mastering" },
                { value: "recording", label: "Grabación" },
            ].filter((i) => i.label.toLowerCase().includes(input.toLowerCase()))
        );
    }, 400);

    const selectedRoles = Object.entries(formik.values.roles)
        .filter(([, v]) => v)
        .map(([k]) => ({ value: k, label: k }));

    const handleRolesChange = (opts) => {
        const updated = { mixing: false, mastering: false, recording: false };
        opts?.forEach((o) => (updated[o.value] = true));
        formik.setFieldValue("roles", updated);
    };

    return (
        <form onSubmit={formik.handleSubmit} className="space-y-6">
            <Input
                label="Nombre"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
            />

            <Input
                label="Nombre artístico"
                name="stageName"
                value={formik.values.stageName}
                onChange={formik.handleChange}
            />

            <Input
                label="Email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
            />

            <Input
                label="Teléfono"
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
            />

            <Input
                label="Ubicación"
                name="location"
                value={formik.values.location}
                onChange={formik.handleChange}
            />

            <AsyncSelect
                isMulti
                cacheOptions
                defaultOptions
                loadOptions={loadRoles}
                value={selectedRoles}
                onChange={handleRolesChange}
            />

            {formik.values.roles.mixing && (
                <FileUploadPlaceholder
                    label="Ejemplo de mezcla"
                    onChange={(file) => formik.setFieldValue("exampleMix", file)}
                />
            )}

            {formik.values.roles.mastering && (
                <FileUploadPlaceholder
                    label="Ejemplo de mastering"
                    onChange={(file) => formik.setFieldValue("exampleMaster", file)}
                />
            )}

            {formik.values.roles.recording && (
                <FileUploadPlaceholder
                    label="Ejemplo de voz"
                    onChange={(file) => formik.setFieldValue("vocalExample", file)}
                />
            )}

            <button type="submit" className="bg-black text-white p-3 rounded">
                Guardar
            </button>
        </form>
    );
}