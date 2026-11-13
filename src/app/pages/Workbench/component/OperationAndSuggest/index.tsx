import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'adapters/reactRouterCompat';

import { IconRight } from '@arco-design/web-react/icon';
import { i18n } from '@babi/tools';
import { Cascader, Link, SelectBlock } from '@byted-babi/babi-design';

import { platformServiceClient } from 'APP/api-lib/platform/microservice/bytedance_babi_platform_service';
import { ListEntityHealthItem } from 'APP/api-lib/platform/microservice/entity_health';
import { workbenchEventReport } from 'APP/pages/Workbench/hooks/useTraceReport';
import workspaceHealthSuccessBg from 'APP/static/workspace_health_success.png';
import workspaceHealthWarningBg from 'APP/static/workspace_health_warning.png';
import { SiteEnNameEnum } from 'Service/productv4/model/common';

import { WorkbenchContext } from '../../index';
import OperationCapacityRadar from '../OperationCapacityRadar';
import {
  getEntityHealthOptionId,
  normalizeProblemCount,
  resolveNextProductResourceId,
  sortEntityHealthOptionsByProblemCount,
} from './selection';

import styles from './index.less?module';

const BUSINESS_PERFORMANCE_TEXT = i18n.t('business_performance', {}, '经营力表现');
const VIEW_DETAILS_TEXT = i18n.t('view_details', {}, '查看详情');
export const PRODUCT_LINE_RESOURCE_TYPE = 'product_line';
export const PRODUCT_RESOURCE_TYPE = 'product';
const INITIAL_RELOAD_COUNT = 0;
const OPERATION_CAPACITY_FROM_WORKSPACE = 'workspace';

interface IOperationAndSuggestProps {
  resourceType: string;
  resourceIds: string[];
  useFullProductOptions?: boolean;
}

interface IResourceBaseOption {
  id: string;
  name: string;
}

interface IHealthCascaderOption {
  label: string;
  value: string;
  children?: IHealthCascaderOption[];
  problemCount?: number;
  disabled?: boolean;
}

interface IHealthSelectOption {
  props?: {
    value?: string | number;
    extra?: ListEntityHealthItem;
  };
  value?: string | number;
  extra?: ListEntityHealthItem;
}

const normalizeSearchText = (value?: string | number) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

const isMatchedByExactIdOrFuzzyName = (inputValue: string, id?: string | number, name?: string) => {
  const keyword = normalizeSearchText(inputValue);
  if (!keyword) {
    return true;
  }

  return normalizeSearchText(id) === keyword || normalizeSearchText(name).includes(keyword);
};

const filterCascaderOption = (inputValue: string, option: IHealthCascaderOption) => {
  return isMatchedByExactIdOrFuzzyName(inputValue, option.value, option.label);
};

const filterEntityHealthOption = (inputValue: string, option: IHealthSelectOption) => {
  const entityInfo = option.props?.extra || option.extra;
  const optionId = option.props?.value ?? option.value ?? getEntityHealthOptionId(entityInfo);
  return isMatchedByExactIdOrFuzzyName(inputValue, optionId, entityInfo?.entity_name);
};

const OperationAndSuggest = (props: IOperationAndSuggestProps) => {
  const { resourceType, resourceIds, useFullProductOptions } = props;
  const history = useHistory();
  const { productLineRes } = useContext(WorkbenchContext);
  const [selectResourceId, setSelectResourceId] = useState<string | undefined>();
  const [selectResourcePath, setSelectResourcePath] = useState<string[]>([]);
  const [entityHealthOptions, setEntityHealthOptions] = useState<ListEntityHealthItem[]>([]);
  const [entityHealthLoading, setEntityHealthLoading] = useState(false);
  const operationCapacityReloadCount = INITIAL_RELOAD_COUNT;

  const normalizedResourceIdList = useMemo(
    () => resourceIds.map(Number).filter(resourceId => Number.isFinite(resourceId)),
    [resourceIds],
  );

  const productLineOptions = useMemo<IResourceBaseOption[]>(
    () =>
      resourceIds.map(resourceId => {
        const matchedOption = productLineRes?.find(option => option.id === Number(resourceId));
        return {
          id: resourceId,
          name: matchedOption?.name || resourceId,
        };
      }),
    [productLineRes, resourceIds],
  );

  const orderedProductHealthOptions = useMemo(() => {
    if (resourceType !== PRODUCT_RESOURCE_TYPE) {
      return [];
    }

    // 经营力卡片的商品搜索下拉需要优先暴露问题最多的商品，因此以前端对 problem_count 做稳定降序兜底。
    return sortEntityHealthOptionsByProblemCount(entityHealthOptions);
  }, [entityHealthOptions, resourceType]);

  const productHealthOptionIdSet = useMemo(
    () => new Set(orderedProductHealthOptions.map(item => getEntityHealthOptionId(item)).filter(Boolean)),
    [orderedProductHealthOptions],
  );

  const productLineCascaderOptions = useMemo<IHealthCascaderOption[]>(() => {
    if (resourceType !== PRODUCT_LINE_RESOURCE_TYPE) {
      return [];
    }

    const productOptionsByProductLine = entityHealthOptions.reduce<Record<string, IHealthCascaderOption[]>>(
      (result, item) => {
        const parentEntityId = item.top_entity_id == null ? '' : String(item.top_entity_id);
        const entityId = getEntityHealthOptionId(item);
        if (!parentEntityId || !entityId) {
          return result;
        }

        if (!result[parentEntityId]) {
          result[parentEntityId] = [];
        }
        result[parentEntityId].push({
          label: item.entity_name || entityId,
          value: entityId,
          problemCount: normalizeProblemCount(item.problem_count),
        });
        return result;
      },
      {},
    );

    Object.keys(productOptionsByProductLine).forEach(productLineId => {
      productOptionsByProductLine[productLineId].sort((left, right) => {
        const problemCountDiff = normalizeProblemCount(right.problemCount) - normalizeProblemCount(left.problemCount);
        if (problemCountDiff !== 0) {
          return problemCountDiff;
        }
        return left.label.localeCompare(right.label, 'zh-Hans-CN');
      });
    });

    return productLineOptions.map(productLine => {
      const children = productOptionsByProductLine[productLine.id] || [];
      return {
        label: productLine.name,
        value: productLine.id,
        children,
      };
    });
  }, [entityHealthOptions, productLineOptions, resourceType]);

  useEffect(() => {
    if (resourceType !== PRODUCT_LINE_RESOURCE_TYPE) {
      return;
    }

    const matchedProductPath = productLineCascaderOptions.reduce<string[] | undefined>((result, option) => {
      if (result) {
        return result;
      }
      const matchedProduct = option.children?.find(childOption => childOption.value === selectResourceId);
      return matchedProduct ? [option.value, matchedProduct.value] : undefined;
    }, undefined);
    if (matchedProductPath) {
      setSelectResourcePath(matchedProductPath);
      return;
    }

    const firstProductLineWithProduct = productLineCascaderOptions.find(option => option.children?.[0]);
    const firstProduct = firstProductLineWithProduct?.children?.[0];
    if (!firstProductLineWithProduct || !firstProduct) {
      // 产品线 ID 不是经营力商品 ID；当所选产品线下没有商品时必须清空，避免跳转/查询误用产品线 ID。
      setSelectResourcePath([]);
      setSelectResourceId(undefined);
      return;
    }

    // 产品线视角的经营力卡片实际查询粒度必须是商品：当前商品失效时才回退到问题数最高的有效商品。
    setSelectResourcePath([firstProductLineWithProduct.value, firstProduct.value]);
    setSelectResourceId(firstProduct.value);
  }, [productLineCascaderOptions, resourceType, selectResourceId]);

  useEffect(() => {
    if (resourceType !== PRODUCT_RESOURCE_TYPE) {
      return;
    }

    const nextResourceId = resolveNextProductResourceId(selectResourceId, orderedProductHealthOptions);
    if (nextResourceId === selectResourceId) {
      return;
    }

    // 商品视角只认经营力候选列表中的有效商品：当前 id 有效则保留，失效时才回退到 problem_count 最大的商品。
    setSelectResourceId(nextResourceId);
  }, [orderedProductHealthOptions, resourceType, selectResourceId]);

  const reportFilterChange = useCallback((nextResourceId: string | undefined) => {
    const params = {
      value: nextResourceId ? JSON.stringify(nextResourceId) : undefined,
      action: 'filter_change',
      context: BUSINESS_PERFORMANCE_TEXT,
    };
    workbenchEventReport(params, true);
  }, []);

  useEffect(() => {
    let active = true;

    const fetchEntityHealthOptions = async () => {
      const shouldUseFullProductOptions = resourceType === PRODUCT_RESOURCE_TYPE && useFullProductOptions;
      if (
        (!shouldUseFullProductOptions && normalizedResourceIdList.length === 0) ||
        (resourceType !== PRODUCT_RESOURCE_TYPE && resourceType !== PRODUCT_LINE_RESOURCE_TYPE)
      ) {
        setEntityHealthOptions([]);
        return;
      }

      setEntityHealthLoading(true);
      try {
        const response = await platformServiceClient.ListForEntityHealth(
          resourceType === PRODUCT_RESOURCE_TYPE
            ? shouldUseFullProductOptions
              ? {}
              : { entity_id_list: normalizedResourceIdList }
            : { parent_entity_list: normalizedResourceIdList },
        );
        if (!active) {
          return;
        }
        setEntityHealthOptions(
          sortEntityHealthOptionsByProblemCount(
            (response.data || []).filter(item => item.site_id === SiteEnNameEnum.babi),
          ),
        );
      } catch {
        if (active) {
          setEntityHealthOptions([]);
        }
      } finally {
        if (active) {
          setEntityHealthLoading(false);
        }
      }
    };

    fetchEntityHealthOptions();
    return () => {
      active = false;
    };
  }, [normalizedResourceIdList, resourceType, useFullProductOptions]);

  const renderResourceOption = useCallback(
    (props: { id: string; name: string; problemCount?: number; active: boolean }) => {
      const { id, name, problemCount, active } = props;
      return (
        <div className={`${styles.resource_option} ${active ? styles.resource_option_active : ''}`}>
          <span className={styles.resource_option_name}>{name || id}</span>
          <span className={styles.resource_option_text}>
            <span className={styles.resource_option_count}>{problemCount || 0}</span>
            {`${i18n.t('k4046372284', {}, '个指标未达标')}`}
          </span>
        </div>
      );
    },
    [],
  );

  const productFilter = useMemo(
    () => (
      <SelectBlock
        value={selectResourceId}
        addBefore={i18n.t('products', {}, '商品')}
        loading={entityHealthLoading}
        showSearch={{ retainInputValueWhileSelect: true }}
        style={{ width: '100%' }}
        dropdownMenuStyle={{ maxWidth: '100%' }}
        filterOption={filterEntityHealthOption}
        renderFormat={(option, value) => {
          return option?.extra?.entity_name || String(value);
        }}
        onChange={value => {
          const nextResourceId = Array.isArray(value) ? value[0] : value;
          setSelectResourceId(nextResourceId);
          reportFilterChange(nextResourceId);
        }}
      >
        {orderedProductHealthOptions.map(item => {
          const optionId = getEntityHealthOptionId(item);
          return (
            <SelectBlock.Option value={optionId} key={optionId} extra={item}>
              {renderResourceOption({
                id: optionId,
                name: item.entity_name || optionId,
                problemCount: normalizeProblemCount(item.problem_count),
                active: optionId === selectResourceId,
              })}
            </SelectBlock.Option>
          );
        })}
      </SelectBlock>
    ),
    [entityHealthLoading, orderedProductHealthOptions, renderResourceOption, reportFilterChange, selectResourceId],
  );

  const productLineFilter = useMemo(
    () => (
      <Cascader
        value={selectResourcePath}
        addBefore={i18n.t('product_line', {}, '产品线')}
        loading={entityHealthLoading}
        options={productLineCascaderOptions}
        showSearch={{ retainInputValueWhileSelect: true }}
        filterOption={filterCascaderOption}
        showEmptyChildren
        style={{ width: '100%' }}
        onChange={value => {
          const nextPath = value.map(String);
          const nextResourceId = nextPath[nextPath.length - 1];
          if (!nextResourceId || nextPath.length < 2) {
            return;
          }
          setSelectResourcePath(nextPath);
          setSelectResourceId(nextResourceId);
          reportFilterChange(nextResourceId);
        }}
        renderOption={(option, level) => {
          const nextOption = option as IHealthCascaderOption;
          if (level === 1) {
            return renderResourceOption({
              id: nextOption.value,
              name: nextOption.label,
              problemCount: nextOption.problemCount,
              active: nextOption.value === selectResourceId,
            });
          }

          return <span className={styles.resource_cascader_parent_option}>{nextOption.label}</span>;
        }}
      />
    ),
    [
      entityHealthLoading,
      productLineCascaderOptions,
      renderResourceOption,
      reportFilterChange,
      selectResourceId,
      selectResourcePath,
    ],
  );

  const filterRender = useMemo(() => {
    if (resourceType === PRODUCT_LINE_RESOURCE_TYPE) {
      return productLineFilter;
    }
    if (resourceType === PRODUCT_RESOURCE_TYPE) {
      return productFilter;
    }
    return null;
  }, [productFilter, productLineFilter, resourceType]);
  const showFilter = resourceType === PRODUCT_LINE_RESOURCE_TYPE || useFullProductOptions || resourceIds?.length > 1;
  const validSelectResourceId = useMemo(() => {
    if (!selectResourceId) {
      return undefined;
    }

    if (resourceType === PRODUCT_RESOURCE_TYPE) {
      return productHealthOptionIdSet.has(selectResourceId) ? selectResourceId : undefined;
    }

    if (resourceType === PRODUCT_LINE_RESOURCE_TYPE) {
      const hasMatchedProduct = productLineCascaderOptions.some(option =>
        option.children?.some(childOption => childOption.value === selectResourceId),
      );
      return hasMatchedProduct ? selectResourceId : undefined;
    }

    return undefined;
  }, [productHealthOptionIdSet, productLineCascaderOptions, resourceType, selectResourceId]);
  const operationCapacityQuery = useMemo(() => ({ entityId: validSelectResourceId }), [validSelectResourceId]);
  const selectedEntityHealthItem = useMemo(
    () => entityHealthOptions.find(item => getEntityHealthOptionId(item) === validSelectResourceId),
    [entityHealthOptions, validSelectResourceId],
  );
  const containerBackgroundStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (useFullProductOptions || !validSelectResourceId || !selectedEntityHealthItem) {
      return undefined;
    }

    const backgroundImage =
      normalizeProblemCount(selectedEntityHealthItem.problem_count) === 0
        ? workspaceHealthSuccessBg
        : workspaceHealthWarningBg;
    return {
      backgroundImage: `url(${backgroundImage})`,
    };
  }, [useFullProductOptions, selectedEntityHealthItem, validSelectResourceId]);

  const toDetail = () => {
    return (
      <Link
        className={styles.to_detail}
        onClick={() => {
          if (!validSelectResourceId) {
            return;
          }

          const params = {
            name: VIEW_DETAILS_TEXT,
            action: 'link_click',
            context: BUSINESS_PERFORMANCE_TEXT,
          };
          workbenchEventReport(params, true);
          history.push(
            `/finance/cockpit/operationCapacity/?id=${validSelectResourceId}&from=${OPERATION_CAPACITY_FROM_WORKSPACE}`,
          );
        }}
      >
        {VIEW_DETAILS_TEXT}
        <IconRight className={styles.icon_right} />
      </Link>
    );
  };
  return (
    <div className={styles.container} style={containerBackgroundStyle}>
      <div className={styles.header}>
        <div className={styles.header_title}>{BUSINESS_PERFORMANCE_TEXT}</div>
        {validSelectResourceId && toDetail()}
      </div>
      {showFilter && <div className={styles.filter}>{filterRender}</div>}
      <OperationCapacityRadar
        loading={entityHealthLoading}
        query={operationCapacityQuery}
        reloadCount={operationCapacityReloadCount}
        selectResourceId={validSelectResourceId}
      />
    </div>
  );
};

export default OperationAndSuggest;
