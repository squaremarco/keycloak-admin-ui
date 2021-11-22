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
  mapValues,
  values,
  isArray,
  isEmpty,
  every,
  omit,
  last,
  map,
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
import type { AttributeForm } from "../components/attribute-form/AttributeForm";
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

type Distributorship = {
  brand: string;
  salesOrganizationAndSoldTo: string;
  defaultShipTo: string;
};

type UserForm = {
  userType: "internal" | "dealer";
  distributorships: Distributorship[];
};

const ATTRIBUTES = ["userType", "distributorships"];

const DISTRIBUTORSHIP_COLUMNS: Array<
  "brand" | "salesOrganizationAndSoldTo" | "defaultShipTo"
> = ["brand", "salesOrganizationAndSoldTo", "defaultShipTo"];

const DISTRIBUTORSHIP_EMPTY_VALUE: Distributorship = {
  brand: "",
  salesOrganizationAndSoldTo: "",
  defaultShipTo: "",
};

const isJson = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

// const useToggle = (d: boolean): [boolean, (o?: boolean) => void] => {
//   const [value, setValue] = useState(d);

//   const toggleValue = useCallback(
//     (o = undefined) => setValue(o || !value),
//     [value]
//   );

//   return [value, toggleValue];
// };

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
      value: "",
      label: t("common:selectOne"),
      isPlaceholder: true,
    },
    {
      value: "org1",
      label: "Brandeburg / Org1",
    },
    {
      value: "org2",
      label: "Pizzaburg / Org2",
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
      className="kc-distributorship__table"
      aria-label="Distributorships values"
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
          <Tr key={distributorship.id} data-testid="distributorship-row">
            <Td
              key={`${distributorship.id}-brand`}
              id={`select-input-${rowIndex}-brand`}
              dataLabel={t("brand")}
            >
              <Controller
                name={`distributorships[${rowIndex}].brand`}
                control={control}
                render={(field) => (
                  <FormSelect
                    {...field}
                    id={`kc-distributorship-brand-${distributorship.id}`}
                    name={`distributorships[${rowIndex}].brand`}
                  >
                    {brandsMock.map(({ ...option }, index) => (
                      <FormSelectOption key={index} {...option} />
                    ))}
                  </FormSelect>
                )}
              />
            </Td>
            <Td
              key={`${distributorship.id}-salesOrganizationAndSoldTo`}
              id={`select-input-${rowIndex}-salesOrganizationAndSoldTo`}
              dataLabel={t("salesOrganizationAndSoldTo")}
            >
              <Controller
                name={`distributorships[${rowIndex}].salesOrganizationAndSoldTo`}
                control={control}
                render={(field) => (
                  <FormSelect
                    {...field}
                    id={`kc-distributorship-salesOrganizationAndSoldTo-${distributorship.id}`}
                    name={`distributorships[${rowIndex}].salesOrganizationAndSoldTo`}
                  >
                    {salesOrganizationMock.map(({ ...option }, index) => (
                      <FormSelectOption key={index} {...option} />
                    ))}
                  </FormSelect>
                )}
              />
            </Td>
            <Td
              key={`${distributorship.id}-defaultShipTo`}
              id={`text-input-${rowIndex}-defaultShipTo`}
              dataLabel={t("defaultShipTo")}
            >
              <TextInput
                name={`distributorships[${rowIndex}].defaultShipTo`}
                ref={register()}
                aria-label="defaultShipTo-input"
                defaultValue={distributorship.defaultShipTo}
                validated={
                  errors.distributorships?.[rowIndex]?.defaultShipTo
                    ? "error"
                    : "default"
                }
                data-testid="distributorships-defaultShipTo-input"
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
                className="kc-distributorship__minus-icon"
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
              className="kc-distributorship__plus-icon"
              onClick={() => array.append(DISTRIBUTORSHIP_EMPTY_VALUE)}
              icon={<PlusCircleIcon />}
              isDisabled={lastDistributorshipIsEmpty}
              data-testid="distributorships-add-row"
            >
              {t("addDistributorshipText")}
            </Button>
          </Td>
        </Tr>
      </Tbody>
    </TableComposable>
  );
};

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
    defaultValues: user.attributes
      ? mapValues((v: any) => {
          return map((i) => (isJson(i) ? JSON.parse(i) : i), v);
        }, user.attributes)
      : {},
  });

  const { handleSubmit, control, errors } = form;

  const array = useFieldArray<Distributorship>({
    control,
    name: "distributorships",
  });

  const save = async (attributeForm: AttributeForm) => {
    try {
      const attributes = pipe(
        pick(ATTRIBUTES),
        mapValues((v) => (isArray(v) ? map((i) => JSON.stringify(i), v) : [v]))
      )(attributeForm!);

      await adminClient.users.update({ id: user.id! }, { ...user, attributes });

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
