import { ApplicationContext } from 'context';
import { MBrepShell } from 'cad/model/mshell';
import { roundValueForPresentation as r } from 'cad/craft/operationHelper';
import { occ2brep } from 'cad/occ/occ2models';
import icon32 from './icon32.png';
import icon96 from './icon96.png';
import { EntityKind } from "cad/model/entities";

export default {
    id: 'fillet_tool',
    label: 'Fillet/Chapher',
    icon: {
        iconSet: {
            medium: {
                iconType: 'image',
                iconContent: icon32
            },
            large: {
                iconType: 'image',
                iconContent: icon96
            }
        },
    },
    info: 'Fillet/Champher',
    mutualExclusiveFields: [],
    paramsInfo: ({ size, opperationType, }) => `(${r(size)} ${r(opperationType)}})`,
    form: [
        {
            type: 'choice',
            style: "dropdown",
            label: 'opperationType',
            name: 'opperationType',
            values: ["Fillet", "Champher"],
            defaultValue: "Fillet",
        },
        {
            type: 'number',
            label: 'size',
            name: 'size',
            defaultValue: 5,
        },

        {
            type: 'selection',
            name: 'edges',
            capture: [EntityKind.EDGE],
            label: 'edges',
            multi: true,
            defaultValue: {
                usePreselection: true,
                preselectionIndex: 0
            },
        },

    ],

    run: (params, ctx: ApplicationContext) => {

        let occ = ctx.occService;
        const oci = occ.commandInterface;
        let returnObject = {
            consumed: [],
            created: [],
        }

        var edgesAndValue = [];

        //add all the edges and size to seperate arrays for each shell that edges are selected from

        params.edges.forEach((edge) => {
            if (!returnObject.consumed.includes(edge.shell)) {
                returnObject.consumed.push(edge.shell);
                edgesAndValue[edge.shell.id] = [];
            }

            if (params.opperationType == "Fillet") {
                //order of parameters is diferent between fillet and champher
                edgesAndValue[edge.shell.id].push(params.size);
                edgesAndValue[edge.shell.id].push(edge);
            }
            if (params.opperationType == "Champher") {
                //order of parameters is diferent between fillet and champher
                edgesAndValue[edge.shell.id].push(edge);
                edgesAndValue[edge.shell.id].push(params.size);
            }
        });

        //perform the opperations on each of the bodies.
        Object.keys(edgesAndValue).forEach((shellToOpperateOnName) => {
            var shellToOpperateOn = edgesAndValue[shellToOpperateOnName];
            var newShellName = shellToOpperateOnName + "f";

            if (params.opperationType == "Fillet") oci.blend(newShellName, shellToOpperateOn[1].shell, ...shellToOpperateOn);
            if (params.opperationType == "Champher") oci.chamf(newShellName, shellToOpperateOn[0].shell, ...shellToOpperateOn);

            returnObject.created.push(occ.io.getShell(newShellName));
        });


        console.log(returnObject);


        return returnObject;
    },

}
