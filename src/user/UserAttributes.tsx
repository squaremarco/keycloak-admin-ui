import React from "react";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { pick, pipe, mapValues } from "lodash/fp";
import {
  ActionGroup,
  AlertVariant,
  Button,
  FormGroup,
  FormSelect,
  FormSelectOption,
  PageSection,
  PageSectionVariants,
} from "@patternfly/react-core";

import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";

import { useAlerts } from "../components/alert/Alerts";
import type { AttributeForm } from "../components/attribute-form/AttributeForm";
import { useAdminClient } from "../context/auth/AdminClient";
import { FormAccess } from "../components/form-access/FormAccess";

type UserAttributesProps = {
  user: UserRepresentation;
};

const ATTRIBUTES = ["userType"];

export const UserAttributes = ({ user }: UserAttributesProps) => {
  const { t } = useTranslation("users");
  const adminClient = useAdminClient();
  const { addAlert, addError } = useAlerts();

  const userTypeFormOptions = [
    {
      key: "user-type-placeholder",
      value: "",
      label: t("selectone"),
      isPlaceholder: true,
    },
    { key: "user-type-dealer", value: "dealer", label: t("dealer") },
    { key: "user-type-internal", value: "internal", label: t("internal") },
  ];

  const { handleSubmit, control, errors } = useForm({
    defaultValues: user.attributes
      ? mapValues((v: any) => v[0], user.attributes)
      : {},
  });

  const save = async (attributeForm: AttributeForm) => {
    try {
      const attributes = pipe(
        pick(ATTRIBUTES),
        mapValues((v) => [v])
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
          isRequired
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
        <ActionGroup>
          <Button data-testid="save-attribute" variant="primary" type="submit">
            {t("common:save")}
          </Button>
        </ActionGroup>
      </FormAccess>
    </PageSection>
  );
};
