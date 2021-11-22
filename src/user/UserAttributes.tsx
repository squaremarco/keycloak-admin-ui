import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Controller,
  useForm,
  useFieldArray,
  ArrayField,
  UseFormMethods,
} from "react-hook-form";
import {
  pick,
  pipe,
  values,
  isEmpty,
  every,
  omit,
  last,
  map,
  toPairs,
  fromPairs,
  cond,
  identity,
  T,
} from "lodash/fp";
import {
  ActionGroup,
  AlertVariant,
  Button,
  FormGroup,
  FormSelect,
  FormSelectOption,
  PageSection,
  PageSectionVariants,
  TextInput,
} from "@patternfly/react-core";

import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";

import { useAlerts } from "../components/alert/Alerts";
import { useAdminClient } from "../context/auth/AdminClient";
import { FormAccess } from "../components/form-access/FormAccess";
import { MinusCircleIcon, PlusCircleIcon } from "@patternfly/react-icons";
import {
  TableComposable,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from "@patternfly/react-table";

type UserAttributesProps = {
  user: UserRepresentation;
};

enum FORM_PROPS_NAMES {
  USER_TYPE = "userType",
  DISTRIBUTORSHIPS = "distributorships",
}

const ATTRIBUTES = [
  FORM_PROPS_NAMES.USER_TYPE,
  FORM_PROPS_NAMES.DISTRIBUTORSHIPS,
];

enum DISTRIBUTORSHIP_PROPS_NAMES {
  BRAND = "brand",
  SALES_ORGANIZATION_AND_SOLD_TO = "salesOrganizationAndSoldTo",
  DEFAULT_SHIP_TO = "defaultShipTo",
}

const DISTRIBUTORSHIP_COLUMNS: Array<DISTRIBUTORSHIP_PROPS_NAMES> = [
  DISTRIBUTORSHIP_PROPS_NAMES.BRAND,
  DISTRIBUTORSHIP_PROPS_NAMES.SALES_ORGANIZATION_AND_SOLD_TO,
  DISTRIBUTORSHIP_PROPS_NAMES.DEFAULT_SHIP_TO,
];

type Distributorship = {
  [DISTRIBUTORSHIP_PROPS_NAMES.BRAND]: string;
  [DISTRIBUTORSHIP_PROPS_NAMES.SALES_ORGANIZATION_AND_SOLD_TO]: string;
  [DISTRIBUTORSHIP_PROPS_NAMES.DEFAULT_SHIP_TO]: string;
};

type UserForm = {
  [FORM_PROPS_NAMES.USER_TYPE]: "internal" | "dealer";
  [FORM_PROPS_NAMES.DISTRIBUTORSHIPS]: Distributorship[];
};

const DISTRIBUTORSHIP_EMPTY_VALUE: Distributorship = {
  [DISTRIBUTORSHIP_PROPS_NAMES.BRAND]: "",
  [DISTRIBUTORSHIP_PROPS_NAMES.SALES_ORGANIZATION_AND_SOLD_TO]: "",
  [DISTRIBUTORSHIP_PROPS_NAMES.DEFAULT_SHIP_TO]: "",
};

type DistributionshipFormProps = {
  form: UseFormMethods<UserForm>;
  array: {
    fields: Partial<ArrayField<Distributorship, "id">>[];
    remove: (index?: number | number[] | undefined) => void;
    append: (
      value: Partial<Distributorship> | Partial<Distributorship>[],
      shouldFocus?: boolean | undefined
    ) => void;
  };
};

const DistributionshipForm = ({ form, array }: DistributionshipFormProps) => {
  const { t } = useTranslation("users");

  const brandsMock = [
    {
      value: "",
      label: t("common:selectOne"),
      isPlaceholder: true,
    },
    {
      value: "brand1",
      label: "Brandeburg",
    },
    {
      value: "brand2",
      label: "Pizzaburg",
    },
  ];

  const salesOrganizationMock = [
    {
      salesOrganization: "",
      soldTo: "",
      label: t("common:selectOne"),
      isPlaceholder: true,
    },
    {
      salesOrganization: "org1",
      soldTo: "client1",
      label: "Org1 / Client1",
    },
    {
      salesOrganization: "org2",
      soldTo: "client2",
      label: "Org2 / Client2",
    },
  ];

  const { register, control, errors, watch } = form;

  const watchDistributorships = watch("distributorships");

  const lastDistributorshipIsEmpty = pipe(
    last,
    omit(["id"]),
    (d: Distributorship) => every(isEmpty, values(d))
  )(watchDistributorships);

  useEffect(() => {
    if (array.fields.length === 0) {
      array.append(DISTRIBUTORSHIP_EMPTY_VALUE);
    }
  }, [array.fields]);

  return (
    <TableComposable
      className={`kc-${FORM_PROPS_NAMES.DISTRIBUTORSHIPS}__table"`}
      variant="compact"
      borders={false}
    >
      <Thead>
        <Tr>
          {DISTRIBUTORSHIP_COLUMNS.map((column) => (
            <Th id={column} key={column}>
              {t(column)}
            </Th>
          ))}
          <Th id="actions" key="actions">
            {t("actions")}
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {array.fields.map((distributorship, rowIndex) => (
          <Tr key={distributorship.id}>
            <Td
              key={`${distributorship.id}-${DISTRIBUTORSHIP_PROPS_NAMES.BRAND}`}
              id={`select-input-${rowIndex}-${DISTRIBUTORSHIP_PROPS_NAMES.BRAND}`}
              dataLabel={t(DISTRIBUTORSHIP_PROPS_NAMES.BRAND)}
            >
              <Controller
                name={`${FORM_PROPS_NAMES.DISTRIBUTORSHIPS}[${rowIndex}].${DISTRIBUTORSHIP_PROPS_NAMES.BRAND}`}
                control={control}
                defaultValue={
                  distributorship[DISTRIBUTORSHIP_PROPS_NAMES.BRAND]
                }
                render={(field) => (
                  <FormSelect
                    {...field}
                    id={`kc-${FORM_PROPS_NAMES.DISTRIBUTORSHIPS}-${DISTRIBUTORSHIP_PROPS_NAMES.BRAND}-${distributorship.id}`}
                    name={`${FORM_PROPS_NAMES.DISTRIBUTORSHIPS}[${rowIndex}].${DISTRIBUTORSHIP_PROPS_NAMES.BRAND}`}
                  >
                    {brandsMock.map(({ ...option }, index) => (
                      <FormSelectOption key={index} {...option} />
                    ))}
                  </FormSelect>
                )}
              />
            </Td>
            <Td
              key={`${distributorship.id}-${DISTRIBUTORSHIP_PROPS_NAMES.SALES_ORGANIZATION_AND_SOLD_TO}`}
              id={`select-input-${rowIndex}-${DISTRIBUTORSHIP_PROPS_NAMES.SALES_ORGANIZATION_AND_SOLD_TO}`}
              dataLabel={t(
                DISTRIBUTORSHIP_PROPS_NAMES.SALES_ORGANIZATION_AND_SOLD_TO
              )}
            >
              <Controller
                name={`${FORM_PROPS_NAMES.DISTRIBUTORSHIPS}[${rowIndex}].${DISTRIBUTORSHIP_PROPS_NAMES.SALES_ORGANIZATION_AND_SOLD_TO}`}
                control={control}
                defaultValue={
                  distributorship[
                    DISTRIBUTORSHIP_PROPS_NAMES.SALES_ORGANIZATION_AND_SOLD_TO
                  ]
                }
                render={(field) => (
                  <FormSelect
                    {...field}
                    id={`kc-${FORM_PROPS_NAMES.DISTRIBUTORSHIPS}-${DISTRIBUTORSHIP_PROPS_NAMES.SALES_ORGANIZATION_AND_SOLD_TO}-${distributorship.id}`}
                    name={`${FORM_PROPS_NAMES.DISTRIBUTORSHIPS}[${rowIndex}].${DISTRIBUTORSHIP_PROPS_NAMES.SALES_ORGANIZATION_AND_SOLD_TO}`}
                  >
                    {salesOrganizationMock.map(
                      ({ salesOrganization, soldTo, ...rest }, index) => (
                        <FormSelectOption
                          {...rest}
                          key={index}
                          value={`${salesOrganization}___${soldTo}`}
                        />
                      )
                    )}
                  </FormSelect>
                )}
              />
            </Td>
            <Td
              key={`${distributorship.id}-${DISTRIBUTORSHIP_PROPS_NAMES.DEFAULT_SHIP_TO}`}
              id={`text-input-${rowIndex}-${DISTRIBUTORSHIP_PROPS_NAMES.DEFAULT_SHIP_TO}`}
              dataLabel={t(DISTRIBUTORSHIP_PROPS_NAMES.DEFAULT_SHIP_TO)}
            >
              <TextInput
                name={`${FORM_PROPS_NAMES.DISTRIBUTORSHIPS}[${rowIndex}].${DISTRIBUTORSHIP_PROPS_NAMES.DEFAULT_SHIP_TO}`}
                ref={register()}
                defaultValue={
                  distributorship[DISTRIBUTORSHIP_PROPS_NAMES.DEFAULT_SHIP_TO]
                }
                aria-label={`${DISTRIBUTORSHIP_PROPS_NAMES.DEFAULT_SHIP_TO} input`}
                validated={
                  errors.distributorships?.[rowIndex]?.[
                    DISTRIBUTORSHIP_PROPS_NAMES.DEFAULT_SHIP_TO
                  ]
                    ? "error"
                    : "default"
                }
              />
            </Td>
            <Td
              key="minus-button"
              id={`kc-minus-button-${rowIndex}`}
              dataLabel={t("actions")}
            >
              <Button
                id={`minus-button-${rowIndex}`}
                aria-label={`remove with value ${distributorship.brand}, ${distributorship.salesOrganizationAndSoldTo} and ${distributorship.defaultShipTo}`}
                variant="link"
                className={`kc-${FORM_PROPS_NAMES.DISTRIBUTORSHIPS}__minus-icon`}
                onClick={() => array.remove(rowIndex)}
              >
                <MinusCircleIcon />
              </Button>
            </Td>
          </Tr>
        ))}
        <Tr>
          <Td>
            <Button
              aria-label={t("addDistributorshipText")}
              id="plus-icon"
              variant="link"
              className={`kc-${FORM_PROPS_NAMES.DISTRIBUTORSHIPS}__plus-icon`}
              onClick={() => array.append(DISTRIBUTORSHIP_EMPTY_VALUE)}
              icon={<PlusCircleIcon />}
              isDisabled={lastDistributorshipIsEmpty}
              data-testid={`${FORM_PROPS_NAMES.DISTRIBUTORSHIPS}-add-row`}
            >
              {t("addDistributorshipText")}
            </Button>
          </Td>
        </Tr>
      </Tbody>
    </TableComposable>
  );
};

const serialize = pipe(
  toPairs,
  map(([k, v]) => {
    if (k === FORM_PROPS_NAMES.DISTRIBUTORSHIPS) {
      return [
        k,
        map(({ brand, defaultShipTo, salesOrganizationAndSoldTo }) => {
          const [salesOrganization, soldTo] =
            salesOrganizationAndSoldTo.split("___");
          return JSON.stringify({
            brand,
            defaultShipTo,
            salesOrganization,
            soldTo,
          });
        }, v),
      ];
    }
    return [k, [v]];
  }),
  fromPairs
);

const deserialize = pipe(
  toPairs,
  map(
    cond([
      [
        ([k]) => k === FORM_PROPS_NAMES.DISTRIBUTORSHIPS,
        ([k, v]) => [
          k,
          map((it) => {
            const { brand, defaultShipTo, salesOrganization, soldTo } =
              JSON.parse(it);

            return {
              brand,
              defaultShipTo,
              salesOrganizationAndSoldTo: `${salesOrganization}___${soldTo}`,
            };
          }, v),
        ],
      ],
      [T, identity],
    ])
  ),
  fromPairs
);

export const UserAttributes = ({ user }: UserAttributesProps) => {
  const { t } = useTranslation("users");
  const adminClient = useAdminClient();
  const { addAlert, addError } = useAlerts();

  const userTypeFormOptions = [
    {
      key: "user-type-placeholder",
      value: "",
      label: t("common:selectOne"),
      isPlaceholder: true,
    },
    { key: "user-type-dealer", value: "dealer", label: t("dealer") },
    { key: "user-type-internal", value: "internal", label: t("internal") },
  ];

  const form = useForm<UserForm>({
    defaultValues: user.attributes ? deserialize(user.attributes) : {},
  });

  const { handleSubmit, control, errors } = form;

  const array = useFieldArray<Distributorship>({
    control,
    name: "distributorships",
  });

  const save = async (userForm: UserForm) => {
    try {
      await adminClient.users.update(
        { id: user.id! },
        {
          ...user,
          attributes: pipe(pick(ATTRIBUTES), serialize)(userForm),
        }
      );

      addAlert(t("userSaved"), AlertVariant.success);
    } catch (error) {
      addError("groups:groupUpdateError", error);
    }
  };

  return (
    <PageSection variant={PageSectionVariants.light}>
      <FormAccess
        isHorizontal
        onSubmit={handleSubmit(save)}
        role="manage-realm"
        className="pf-u-mt-lg"
      >
        <FormGroup
          label={t("userType")}
          fieldId="kc-userType"
          validated={errors.userType ? "error" : "default"}
          helperTextInvalid={t("common:required")}
        >
          <Controller
            name="userType"
            control={control}
            render={(field) => (
              <FormSelect
                {...field}
                id="kc-userType"
                name="userType"
                type="text"
              >
                {userTypeFormOptions.map(({ key, ...option }) => (
                  <FormSelectOption key={key} {...option} />
                ))}
              </FormSelect>
            )}
          />
        </FormGroup>
        <FormGroup
          label={t("distributiorships")}
          fieldId="kc-distributiorships"
          helperTextInvalid={t("common:required")}
        >
          <DistributionshipForm form={form} array={array} />
        </FormGroup>
        <ActionGroup>
          <Button data-testid="save-attribute" variant="primary" type="submit">
            {t("common:save")}
          </Button>
        </ActionGroup>
      </FormAccess>
    </PageSection>
  );
};
