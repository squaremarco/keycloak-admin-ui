import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Control, Controller } from "react-hook-form";
import {
  ActionGroup,
  Button,
  FormGroup,
  Select,
  SelectOption,
  SelectVariant,
  Switch,
} from "@patternfly/react-core";

import { FormAccess } from "../../components/form-access/FormAccess";
import { HelpItem } from "../../components/help-enabler/HelpItem";
import { TimeSelector } from "../../components/time-selector/TimeSelector";
import { TokenLifespan } from "./TokenLifespan";

type AdvancedSettingsProps = {
  control: Control<Record<string, any>>;
  save: () => void;
  reset: () => void;
  protocol?: string;
};

export const AdvancedSettings = ({
  control,
  save,
  reset,
  protocol,
}: AdvancedSettingsProps) => {
  const { t } = useTranslation("clients");
  const [open, setOpen] = useState(false);
  return (
    <FormAccess role="manage-realm" isHorizontal>
      {protocol !== "openid-connect" && (
        <FormGroup
          label={t("assertionLifespan")}
          fieldId="assertionLifespan"
          labelIcon={
            <HelpItem
              helpText="clients-help:assertionLifespan"
              forLabel={t("assertionLifespan")}
              forID={t(`common:helpLabel`, { label: t("assertionLifespan") })}
            />
          }
        >
          <Controller
            name="attributes.saml-assertion-lifespan"
            defaultValue=""
            control={control}
            render={({ onChange, value }) => (
              <TimeSelector
                units={["minutes", "days", "hours"]}
                value={value}
                onChange={onChange}
              />
            )}
          />
        </FormGroup>
      )}
      {protocol === "openid-connect" && (
        <>
          <TokenLifespan
            id="accessTokenLifespan"
            name="attributes.access-token-lifespan"
            defaultValue=""
            units={["minutes", "days", "hours"]}
            control={control}
          />

          <FormGroup
            label={t("oAuthMutual")}
            fieldId="oAuthMutual"
            hasNoPaddingTop
            labelIcon={
              <HelpItem
                helpText="clients-help:oAuthMutual"
                forLabel={t("oAuthMutual")}
                forID={t(`common:helpLabel`, { label: t("oAuthMutual") })}
              />
            }
          >
            <Controller
              name="attributes.tls-client-certificate-bound-access-tokens"
              defaultValue={false}
              control={control}
              render={({ onChange, value }) => (
                <Switch
                  id="oAuthMutual-switch"
                  label={t("common:on")}
                  labelOff={t("common:off")}
                  isChecked={value === "true"}
                  onChange={(value) => onChange("" + value)}
                />
              )}
            />
          </FormGroup>
          <FormGroup
            label={t("keyForCodeExchange")}
            fieldId="keyForCodeExchange"
            hasNoPaddingTop
            labelIcon={
              <HelpItem
                helpText="clients-help:keyForCodeExchange"
                forLabel={t("keyForCodeExchange")}
                forID={t(`common:helpLabel`, {
                  label: t("keyForCodeExchange"),
                })}
              />
            }
          >
            <Controller
              name="attributes.pkce-code-challenge-method"
              defaultValue=""
              control={control}
              render={({ onChange, value }) => (
                <Select
                  toggleId="keyForCodeExchange"
                  variant={SelectVariant.single}
                  onToggle={() => setOpen(!open)}
                  isOpen={open}
                  onSelect={(_, value) => {
                    onChange(value);
                    setOpen(false);
                  }}
                  selections={[value || t("common:choose")]}
                >
                  {["", "S256", "plain"].map((v) => (
                    <SelectOption key={v} value={v}>
                      {v || t("common:choose")}
                    </SelectOption>
                  ))}
                </Select>
              )}
            />
          </FormGroup>
        </>
      )}
      <ActionGroup>
        <Button variant="secondary" onClick={save}>
          {t("common:save")}
        </Button>
        <Button variant="link" onClick={reset}>
          {t("common:revert")}
        </Button>
      </ActionGroup>
    </FormAccess>
  );
};
